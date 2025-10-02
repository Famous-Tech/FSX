# Welcome to the FSX Setup Guide

## In this guide you'll find everythig you need to know before/while using FSX

If you're here, I guess you want to beat everyone in SEO scores. For this, FSX is the right choice. 
 
 Since the dependencies are installed and the FSX template is ready. let's get started!!!
 
  here are the steps to get your application optimized by FSX. First, enter src/client/ and replace the existing architecture and files by yours (Only in the src/client directory), then create an entry-client.tsx file and another entry-server.tsx file with the following contents :

  src/client/entry-client.tsx : 
  ```tsx

  import React from "react";
import "./index.css";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { hydrateRoot } from "react-dom/client";
import App from "./App.tsx";

hydrateRoot(
  document.getElementById("root")!,
  <BrowserRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
);
```

If your app is using a different css file name u can just change it

Now the entry-server.tsx : 
```tsx

import React from "react";
import { StaticRouter } from "react-router-dom";
import App from "./App.tsx";

export default function EntryServer({ url }: { url: string }) {
  return <App />;
}

```

Those will be helpful in the build time

Now there's 2 ways

If you want each page to have their JavaScript file (What i recommend)

In your App.tsx : Add React.lazy imports and Suspense tags on your pages import, if you don't know what are Lazy imports and Suspense, check out React docs or just ask chatGPT/ any AI to do it in your file (That won't hurt)

Like the example below :

```tsx
import React, {Suspense} from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
const Home = React.lazy(() => import("./pages/Home"));
const About = React.lazy(() => import("./pages/About"));
const Services = React.lazy(()=> import("./pages/Services"))
const Projects = React.lazy(()=> import("./pages/Projects"))
const Contact = React.lazy(()=> import("./pages/Contact"))
import { OrganizationStructuredData, WebsiteStructuredData } from './components/StructuredData';

// Composant principal de l'App 
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      

      
      <OrganizationStructuredData />
      <WebsiteStructuredData />
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
```

If you're using tailwindcss i recommend using the V3 as the V4 is really unstable and may not built correctly

Now everything is setup, Let's build and get this #1 on google search.

```bash

pnpm run build
```
the command above will build both (Client's and Server's files to provide an optimized,minified and production ready code)

There's the excepted outpout :

```console

└──╼ $pnpm run build

> my-fsx-app@1.0.0-alpha build /home/famous-tech/Desktop/FSX
> cd src/client && npx vite build --outDir ../../../dist/client --manifest && cd ../../ && npx vite build --ssr src/client/entry-server.tsx --outDir dist/server

vite v7.0.6 building for production...
✓ 1677 modules transformed.
../../../dist/client/.vite/manifest.json                  1.91 kB │ gzip:  0.43 kB
../../../dist/client/assets/main-gelHIP5Z.css            19.71 kB │ gzip:  4.29 kB
../../../dist/client/assets/OptimizedImage-DcH8ZIvI.js    1.01 kB │ gzip:  0.60 kB │ map:     3.67 kB
...
✓ built in 8.02s
vite v7.0.6 building SSR bundle for production...
✓ 11 modules transformed.
dist/server/assets/OptimizedImage-CF4kBoMF.mjs   1.77 kB
dist/server/assets/Projects-17z8dMhr.mjs         6.15 kB
dist/server/assets/About-BMiVLYCA.mjs            6.72 kB
dist/server/assets/Services-DzaGSaV-.mjs         7.38 kB
dist/server/assets/Home-2S34g0HV.mjs             7.90 kB
dist/server/assets/Contact-Bt9LsM4z.mjs          8.66 kB
dist/server/entry-server.mjs                    10.38 kB
✓ built in 495ms
┌─[famous-tech@parrot]─[~/Desktop/FSX]

```

Now you can easily head back to the Readme for execution and deployment.


2. If you don't want to use Lazy imports and suspense
There are rhe steps to use FSX

* Let your React App how it's
* add the two entry files like in the example above
* in `src/server/routes/ssr.js` , change the method from "stream" to "string"
* Test it, if it doesn't work or is thwrowing any error, open an issue on the Github repo or contact the Owner directly (Via mail or Whatsapp) 


### Additional infos : 

- Change the custom SEO Metadatas for each routes at `src/server/utils/renderer.js` and `src/server/utils/headers.html.js`
- Read the code. test it, and edit what doesn't fit to you bcs it's not mine, not my communuty's, but **OUR** code.

You liked it ? Why not star this Repo ?