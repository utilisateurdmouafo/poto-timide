import { useEffect, useRef, useState } from "react";

export default function App() {
  const appRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadedScripts = [];
    const loadedStyles = [];

    async function mountApplication() {
      try {
        const response = await fetch(`/legacy.html${window.location.search}${window.location.hash}`, {
          credentials: "same-origin",
        });
        if (!response.ok) throw new Error(`Chargement de l’application impossible (${response.status}).`);
        const html = await response.text();
        const parsed = new DOMParser().parseFromString(html, "text/html");
        const app = appRef.current;
        if (!app || cancelled) return;

        document.title = parsed.title || "Poto Timide";
        document.documentElement.lang = parsed.documentElement.lang || "fr";
        let hasSession = false;
        try {
          hasSession = Boolean(JSON.parse(localStorage.getItem("poto-timide-session") || "null")?.memberId);
        } catch {
          hasSession = false;
        }
        document.documentElement.classList.toggle("has-session", hasSession);
        document.documentElement.classList.toggle("needs-login", !hasSession);

        for (const source of parsed.head.querySelectorAll("meta, link[rel], style")) {
          if (
            source.tagName === "META" &&
            (source.hasAttribute("charset") ||
              (source.name && document.head.querySelector(`meta[name="${CSS.escape(source.name)}"]`)))
          ) {
            continue;
          }
          const resource = document.createElement(source.tagName.toLowerCase());
          for (const attribute of source.attributes) resource.setAttribute(attribute.name, attribute.value);
          resource.textContent = source.textContent;
          document.head.append(resource);
          loadedStyles.push(resource);
        }

        app.innerHTML = parsed.body.innerHTML;
        for (const source of app.querySelectorAll("script")) {
          const clone = document.createElement("script");
          for (const attribute of source.attributes) clone.setAttribute(attribute.name, attribute.value);
          if (!source.src) clone.textContent = source.textContent;
          source.replaceWith(clone);
          loadedScripts.push(clone);
          if (clone.src) {
            await new Promise((resolve, reject) => {
              clone.onload = resolve;
              clone.onerror = () => reject(new Error(`Impossible de charger ${clone.src}`));
            });
          }
          if (cancelled) return;
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Erreur de chargement.");
      }
    }

    mountApplication();
    return () => {
      cancelled = true;
      for (const script of loadedScripts) script.remove();
      for (const link of loadedStyles) link.remove();
    };
  }, []);

  if (error) {
    return (
      <main className="load-error" role="alert">
        <h1>Poto Timide</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} type="button">Recharger</button>
      </main>
    );
  }

  return <div className="application-host" ref={appRef} />;
}
