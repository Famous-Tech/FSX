import express from "express";
const router = express.Router();
import { Renderer } from "../utils/renderer.js";
import path from "path";
import Resolver from "../utils/resolver.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let robotsFile = path.resolve(__dirname, "../www/robots.txt");
let sitemapFile = path.resolve(__dirname, "../www/sitemap.xml");

const assets = new Resolver();

// Route catch-all for SSR
router.get("{/*splat}", async (req, res) => {
  try {
    const assets = new Resolver();

    // Validate URL
    if (!req.url || req.url.includes("..")) {
      return res.status(400).send("Invalid URL");
    }

    // Special rules
    if (req.url === "/robots.txt") {
      return res.status(200).sendFile(robotsFile);
    } else if (req.url.includes("sitemap.xml")) {
      // automatic sitemap creation comming soon...
      return res.status(200).sendFile(sitemapFile);
    }
    const method = process.env.RENDERING_METHOD || "stream";
    /*
    Use method = "string" to wait for the HTML to be rendered,
    cached and finally sent to client.
    And the default configuration
    method = "stream" to send all HTML on the fly (Even better for SEO)
    
  */
    // Default SSR rendering
    await new Renderer(req.url, res, method).renderPage(method);
  } catch (error) {
    console.error("SSR Error:", error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Server Error</title>
      </head>
      <body>
        <h1>Internal Server Error</h1>
        <p>An error occurred while rendering the page.</p>
      </body>
      </html>
    `);
  }
});

export default router;
