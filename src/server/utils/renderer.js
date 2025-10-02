const React = require("react");
const { renderToString } = require("react-dom/server");
const { StaticRouter } = require("react-router-dom");
const { renderToPipeableStream } = require("react-dom/server");
const Resolver = require("./resolver");
const { getMetaData } = require("./headers.html.js");
const path = require("path")

// --- Meta Data ---
const pageMetaData = {
  "/": {
    title: "FAMOUS-TECH - Solutions Digitales Innovantes en Haïti",
    description:
      "Famous-Tech - Votre partenaire de confiance pour le développement web et mobile en Haïti. Transformez vos idées en solutions digitales.",
    url: "https://www.famoustech.xyz",
  },
  "/services": {
    title: "Nos Services - FAMOUS-TECH",
    description:
      "Découvrez nos services de développement web, applications mobiles, et solutions digitales sur mesure en Haïti.",
    url: "https://www.famoustech.xyz/services",
  },
  "/about": {
    title: "À Propos - FAMOUS-TECH",
    description:
      "Apprenez-en plus sur Famous-Tech, votre équipe de développement digital en Haïti.",
    url: "https://www.famoustech.xyz/about",
  },
  "/contact": {
    title: "Contactez-nous - FAMOUS-TECH",
    description:
      "Contactez Famous-Tech pour vos projets de développement web et mobile en Haïti.",
    url: "https://www.famoustech.xyz/contact",
  },
  "/portfolio": {
    title: "Portfolio de FAMOUS-TECH",
    description:
      "Découvrez nos réalisations et projets en développement web et mobile.",
    url: "https://www.famoustech.xyz/portfolio",
  },
};

const getPageMeta = (path) => {
  const cleanPath = path.split("?")[0].split("#")[0];
  return pageMetaData[cleanPath] || pageMetaData["/"];
};

class Renderer {
  constructor(url, res, method) {
    this.url = url;
    this.res = res;
    this.method = method;
    this.resolver = new Resolver();
  }

  async renderPage(method) {
    if (!method) {
      throw new Error(
        "method is required, make sure to use the method parameter while calling the Renderer Method"
      );
    }
    if (method.match("stream")) {
      await this._renderToStream(this.url, this.res);
    } else if (method.match("string")) {
      await this._renderToString(this.url);
    }
  }

  async _loadApp() {
    const mod = await import(
      path.resolve(process.cwd(), "dist/server/entry-server.mjs")
    );
    return mod.default || mod.render || mod;
  }

  /* WARNING :
    renderToString function will NOT work
    if you are using React.Lazy and Suspense in your React project.
    That's why FSX uses by default a Stream based Server Side Rendering
    for compatibility & Performance.
    Feel free to change the "method" parameter in `src/server/routes/ssr.js`
    As FSX uses renderToPipeableStream by default, we highly recommend to use it
    Because _renderToString may not work as expected
  */
  async _renderToString(url) {
    try {
      const context = {};
      const cssFile = await this.resolver.getCSS();
      const jsFile = await this.resolver.getSingleBundle();

      const EntryServer = await this._loadApp();

      const appHTML = renderToString(
        React.createElement(
          StaticRouter,
          { location: url, context },
          React.createElement(EntryServer, { url })
        )
      );

      if (context.url) {
        console.warn(`Request was redirected to: ${context.url}`);
        return;
      }

      const pageMeta = getPageMeta(url);
      const fullHTML = `
      <!DOCTYPE html>
      <html lang="fr-HT">
      <head>
        <link rel="stylesheet" href="${cssFile}">
        ${getMetaData(pageMeta)}
      </head>
      <body>
        <div id="root">${appHTML}</div>
        <script src="${jsFile}" defer></script>
      </body>
      </html>
      `;

      return fullHTML;
    } catch (error) {
      console.error("Error rendering the page", error);
      return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Error - FSX RENDERING FAILED</title>
        </head>
        <body>
          <div id="root">
            <h1>Une erreur s'est produite</h1>
            <p>Veuillez réessayer plus tard.</p>
          </div>
        </body>
        </html>
      `;
    }
  }

  async _renderToStream(url, res) {
    try {
      const context = {};
      // Auto-discover page key from manifest
      const pageKey = await this.resolver._getPageKey(url);
      
      if (!pageKey) {
        console.error(`No page found for URL: ${url}`);
        return res.status(404).send("Page not found");
      }

      const pageMeta = getPageMeta(url);
      const cssFile = await this.resolver.getCSS();
      const jsFiles = await this.resolver.getChunksPerPage(pageKey);

      if (!jsFiles) {
        console.error(`No JS files found for page key: ${pageKey}`);
        return res.status(404).send("Page not found");
      }

      const scriptFiles = [...jsFiles]
        .map((f) => `<script type="module" src="/dist/${f}" defer></script>`)
        .join("\n");

      const EntryServer = await this._loadApp();

      const { pipe } = renderToPipeableStream(
        React.createElement(
          StaticRouter,
          { location: url, context },
          React.createElement(EntryServer, { url })
        ),
        {
          onShellReady() {
            if (res.writableEnded) return;
            res.setHeader("content-type", "text/html; charset=utf-8");
            res.write(`<!DOCTYPE html>
              <html lang="fr-HT">
              <head>
                <link rel="stylesheet" href="/dist/${cssFile}" />
                ${getMetaData(pageMeta)}
              </head>
              <body>
                <div id="root">`);
            pipe(res);
          },
          onAllReady() {
            if (res.writableEnded) return;
            res.write(`</div>
              ${scriptFiles}
              </body>
              </html>`);
            res.end();
          },
          onError(error) {
            console.error("Streaming error:", error);
            if (!res.headersSent) {
              res.status(500).send("Internal Server Error");
            }
          },
        }
      );
    } catch (error) {
      console.error(`ERROR WHILE STREAMING THE PAGE : ${error}`);
      if (!res.headersSent) {
        res.status(500).send("Internal Server Error");
      }
    }
  }
}

module.exports = { Renderer };