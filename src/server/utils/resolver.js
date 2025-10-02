const { readFile } = require("fs/promises");
const path = require('path');

class Resolver {
  constructor() {
    this.assetsBase = path.resolve("./dist/client/");
    this.manifestPath = path.resolve(this.assetsBase, ".vite/manifest.json");
  }

  async _readManifest() {
    try {
      const content = await readFile(this.manifestPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Error reading manifest:", error);
      return null;
    }
  }

  /**
   * Auto-discovers routes from manifest dynamicImports
   * Looks at entry-client.tsx dynamicImports and creates route mapping
   * Example: ../pages/Home.tsx -> "/" , ../pages/About.tsx -> "/about"
   */
  async _getPageKey(url) {
    const manifest = await this._readManifest();
    if (!manifest) return null;

    // Get all dynamic imports from entry-client
    const entryClient = manifest["../entry-client.tsx"];
    if (!entryClient || !entryClient.dynamicImports) {
      console.error("No dynamicImports found in entry-client.tsx");
      return null;
    }

    // Create route mapping from dynamicImports
    const routes = {};
    for (const pageImport of entryClient.dynamicImports) {
      // Extract page name from path: ../pages/Home.tsx -> Home
      const pageName = path.basename(pageImport, path.extname(pageImport));
      
      // Home becomes "/" , others become "/lowercase"
      const route = pageName === "Home" ? "/" : `/${pageName.toLowerCase()}`;
      routes[route] = pageImport;
    }

    return routes[url] || null;
  }

  /**
   * Get all available routes from manifest
   * Useful for debugging or generating sitemaps
   */
  async getAvailableRoutes() {
    const manifest = await this._readManifest();
    if (!manifest) return [];

    const entryClient = manifest["../entry-client.tsx"];
    if (!entryClient || !entryClient.dynamicImports) return [];

    const routes = [];
    for (const pageImport of entryClient.dynamicImports) {
      const pageName = path.basename(pageImport, path.extname(pageImport));
      const route = pageName === "Home" ? "/" : `/${pageName.toLowerCase()}`;
      routes.push(route);
    }

    return routes;
  }

  // the getSingleBundle function is especially for renderToString usage, when all pages and modules are in a single file
  async getSingleBundle() {
    const manifest = await this._readManifest();
    if (!manifest) return null;
    const result = manifest["../main.tsx"];
    if (result && result.file) {
      // Return manifest file path (e.g., a main-xxx file)
      return result.file;
    }
    return null;
  }

  async getCSS() {
    const manifest = await this._readManifest();
    if (!manifest) return null;
    const result = manifest["../entry-client.tsx"];
    if (result && result.css && result.css[0]) {
      return result.css[0];
    }
    return null;
  }

  async getChunksPerPage(pageKey) {
    const manifest = await this._readManifest();
    // if you want to debug this function, try logging it to see if u get the correct pageKey as it's used in the func, if it's not the problem try logging next steps or look for any error
    let jsFiles = new Set();
    if (!manifest) {
      throw new Error("Manifest doesn't exist");
    }
    // Add the page's own file
    if (manifest[pageKey] && manifest[pageKey].file) {
      const pageFile = manifest[pageKey].file;
      // console.log(`[RESOLVER] Found ${pageFile} for the query ${pageKey}`);
      jsFiles.add(pageFile);
    }
    // Add the entry-client and its resolved imports
    const entry = manifest["../entry-client.tsx"];
    if (entry && entry.file) {
      jsFiles.add(entry.file);
      if (Array.isArray(entry.imports)) {
        for (const importId of entry.imports) {
          const resolved = manifest[importId]?.file;
          if (resolved) jsFiles.add(resolved);
        }
      }
    }
    // Add page dynamic imports
    if (manifest[pageKey] && Array.isArray(manifest[pageKey].imports)) {
      for (const importId of manifest[pageKey].imports) {
        const resolved = manifest[importId]?.file;
        if (resolved) jsFiles.add(resolved);
      }
    }
    return jsFiles;
  }
}

module.exports = Resolver;