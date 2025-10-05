// require('esbuild-register/dist/node').register();
// require('ignore-styles').default(['.css', '.scss', '.sass']);
import "dotenv/config.js";
import app from "./config/app.js";
import routes from "./routes/index.js"
const PORT = Number(process.env.PORT) || 3000;

app.use(routes);

app.listen(PORT, () => {
  console.log(`FSX server is running on http://localhost:${PORT}`);
});
