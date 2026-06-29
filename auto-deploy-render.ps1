$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$RenderCli = Get-ChildItem "$ProjectDir\tools\render" -Recurse -Filter "cli_*.exe" | Select-Object -First 1 -ExpandProperty FullName
$StatusFile = "$ProjectDir\deploy-status.txt"
$UrlFile = "$ProjectDir\lien-public.txt"

function Set-Status([string]$Message) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$timestamp - $Message" | Out-File -FilePath $StatusFile -Encoding UTF8
}

Set-Status "Demarrage du deploiement automatique..."

# Attendre connexion GitHub (max 30 min)
$githubReady = $false
for ($i = 0; $i -lt 180; $i++) {
  gh auth status 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) {
    $githubReady = $true
    break
  }
  Start-Sleep -Seconds 10
}

if (-not $githubReady) {
  Set-Status "ERREUR: GitHub non connecte. Lancez: gh auth login -w"
  exit 1
}

Set-Status "GitHub connecte."

$ghUser = (gh api user -q .login).Trim()
$repoName = "poto-timide"
$repoUrl = "https://github.com/$ghUser/$repoName"

if (-not (Test-Path ".git")) {
  git init | Out-Null
  git branch -M main
}

git add .
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git -c user.email="deploy@poto-timide.local" -c user.name="Poto Timide" commit -m "Auto deploy Render" | Out-Null
}

gh repo view "$ghUser/$repoName" 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  gh repo create $repoName --public --source . --remote origin --push | Out-Null
} else {
  git remote remove origin 2>$null
  git remote add origin $repoUrl
  git push -u origin main --force | Out-Null
}

Set-Status "Code pousse sur GitHub: $repoUrl"

if (-not $RenderCli -or -not (Test-Path $RenderCli)) {
  Set-Status "ERREUR: Render CLI introuvable."
  exit 1
}

# Attendre connexion Render (max 30 min)
$renderReady = $false
for ($i = 0; $i -lt 180; $i++) {
  & $RenderCli whoami -o text --confirm 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) {
    $renderReady = $true
    break
  }
  if ($i -eq 0) {
    Start-Process $RenderCli -ArgumentList "login" -NoNewWindow -Wait
  } else {
    Start-Sleep -Seconds 10
  }
}

if (-not $renderReady) {
  Set-Status "ERREUR: Render non connecte. Lancez: tools\render\...\render.exe login"
  exit 1
}

Set-Status "Render connecte."

& $RenderCli blueprints validate render.yaml -o text --confirm
if ($LASTEXITCODE -ne 0) {
  Set-Status "ERREUR: render.yaml invalide."
  exit 1
}

$existing = & $RenderCli services list -o json --confirm 2>$null | ConvertFrom-Json
$service = $existing | Where-Object { $_.name -eq "poto-timide" -or $_.service.name -eq "poto-timide" } | Select-Object -First 1

if (-not $service) {
  & $RenderCli services create `
    --name poto-timide `
    --repo $repoUrl `
    --branch main `
    --type web_service `
    --runtime node `
    --plan free `
    --region frankfurt `
    --build-command "npm install" `
    --start-command "node server.js" `
    --health-check-path "/" `
    --env-var "NODE_ENV=production" `
    -o json --confirm | Out-Null

  if ($LASTEXITCODE -ne 0) {
    Set-Status "ERREUR: creation du service Render."
    exit 1
  }
}

$services = & $RenderCli services list -o json --confirm | ConvertFrom-Json
$target = $services | ForEach-Object { if ($_.service) { $_.service } else { $_ } } | Where-Object { $_.name -eq "poto-timide" } | Select-Object -First 1

if (-not $target) {
  Set-Status "ERREUR: service poto-timide introuvable apres creation."
  exit 1
}

$serviceId = $target.id
& $RenderCli deploys create $serviceId --wait -o text --confirm

$liveUrl = "https://poto-timide.onrender.com"
if ($target.serviceDetails -and $target.serviceDetails.url) {
  $liveUrl = $target.serviceDetails.url
} elseif ($target.url) {
  $liveUrl = $target.url
}

$liveUrl | Out-File -FilePath $UrlFile -Encoding UTF8
Set-Status "PRET: $liveUrl"

# Verifier HTTP
for ($i = 0; $i -lt 30; $i++) {
  try {
    $resp = Invoke-WebRequest -Uri $liveUrl -UseBasicParsing -TimeoutSec 20
    if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
      Set-Status "EN LIGNE: $liveUrl"
      exit 0
    }
  } catch {}
  Start-Sleep -Seconds 10
}

Set-Status "DEPLOY LANCE (peut prendre 5 min): $liveUrl"
exit 0