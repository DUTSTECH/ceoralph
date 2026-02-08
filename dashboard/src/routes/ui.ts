import { Hono } from "hono";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uiDir = join(__dirname, "..", "..", "ui");

const ui = new Hono();

ui.get("/", (c) => {
  const html = readFileSync(join(uiDir, "index.html"), "utf-8");
  return c.html(html);
});

ui.get("/style.css", (c) => {
  const css = readFileSync(join(uiDir, "style.css"), "utf-8");
  c.header("Content-Type", "text/css");
  return c.body(css);
});

ui.get("/app.js", (c) => {
  const js = readFileSync(join(uiDir, "app.js"), "utf-8");
  c.header("Content-Type", "application/javascript");
  return c.body(js);
});

export default ui;
