import express from 'express';
import errorHandler from '../middleware/errorHandler.js';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import redis from '../utils/redis.js'; 


let cacheOptions = {
  maxAge: '2y',
  etag: false
};

const app = express();

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


function setStaticHeaders(res, filePath) {
  try {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
  } catch (_) {
    // no-op
  }
}

// Security
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'", 
      "https://cdn.tailwindcss.com", 
      "https://googletagmanager.com", 
      "https://www.google-analytics.com", 
      "https://www.gstatic.com"
    ],
    imgSrc: [
      "'self'", 
      "data:", 
      "https://unsplash.com", 
      "https://images.unsplash.com", 
      "https://files.catbox.moe", 
      "https://media.istockphoto.com", 
      "https://cdn.famoustech.xyz"
    ],
    styleSrc: [
      "'self'", 
      "'unsafe-inline'", 
      "https://cdn.tailwindcss.com"
    ],
    fontSrc: ["'self'"]
  }
}));

app.use(compression());

// Middleware Redis Cache
async function redisImageCache(req, res, next) {
  try {
    const key = `IMG:${req.originalUrl}`;
    const cached = await redis.get(key);
    if (cached) {
      console.log(`[CACHE-HIT] ${key}`);
    return res.send(`data:image/png;base64, ${cached}`)
    }
    
    // capture response to cache
    const originalSend = res.send.bind(res);
    res.send = (body) => {
      if (res.get('Content-Type')?.startsWith('image')) {
        redis.set(key, body.toString('base64'), { EX: 60 * 60 * 24 }); // 1 jour
        console.log(`[CACHE-SET] ${key}`);
      }
      return originalSend(body);
    };
    
    next();
  } catch (error) {
    console.error('[REDIS-CACHE-ERROR]', error);
    next(); // fail silently
  }
}


app.use('/images', redisImageCache);
app.use('/favicons', redisImageCache);

// Serve built assets (JS/CSS) and images after the middleware correctly set caches
app.use('/assets', express.static(path.join(__dirname, '../../../dist/client/assets'), { ...cacheOptions, setHeaders: setStaticHeaders }));
app.use('/favicons', express.static(path.join(__dirname, '../images/favicons'), cacheOptions));
app.use('/images', express.static(path.join(__dirname, '../images'), cacheOptions));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('/www'));
app.use(express.static('public'));
app.use('/dist', express.static(path.join(__dirname, '../../../dist/client'), { ...cacheOptions, setHeaders: setStaticHeaders }));

// Gestion des erreurs
app.use(errorHandler);

export default app;
