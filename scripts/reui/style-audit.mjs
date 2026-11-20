import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
function walk(dir) {
  return !fs.existsSync(dir)
    ? []
    : fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((item) =>
          item.isDirectory()
            ? ["node_modules", "dist"].includes(item.name)
              ? []
              : walk(path.join(dir, item.name))
            : /\.(css|scss|html)$/.test(item.name)
              ? [path.join(dir, item.name)]
              : [],
        );
}
function docsHost(dir) {
  return !fs.existsSync(dir)
    ? []
    : fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((item) =>
          item.isDirectory()
            ? docsHost(path.join(dir, item.name))
            : /\.(vue|ts|css)$/.test(item.name)
              ? [path.join(dir, item.name)]
              : [],
        );
}
const candidates = new Set([
  ...walk("src"),
  ...walk("playground"),
  ...docsHost("docs/.vitepress"),
  ...[
    "index.html",
    "postcss.config.js",
    "playground/postcss.config.js",
    "playground/tailwind.config.js",
    "docs/vite.config.ts",
    "docs/uno.config.ts",
    "playwright.config.ts",
    "tests/vite.config.ts",
  ].filter((p) => fs.existsSync(p)),
  ...[
    "components.json",
    "tailwind.config.js",
    "vite.config.ts",
    "vite.config.lib.ts",
    "tsconfig.json",
    "playground/vite.config.ts",
    "playground/tsconfig.json",
    "package.json",
    "playground/package.json",
    ".github/workflows/pages.yml",
    ".github/workflows/ci.yml",
  ].filter((p) => fs.existsSync(p)),
]);
const entries = [...candidates].sort().map((file) => {
  const text = fs.readFileSync(file, "utf8");
  return {
    file,
    sha256: crypto.createHash("sha256").update(text).digest("hex"),
    role: file.startsWith("docs/.vitepress/")
      ? "retained upstream Vue/VitePress documentation host (not Pages artifact)"
      : /\.(css|scss)$/.test(file)
        ? "scoped styles/theme/document layout"
        : file.endsWith(".html")
          ? "static build entry"
          : file.includes("workflows")
            ? "CI / deploy (no npm publishing)"
            : "build/config/package boundary",
    evidence: file.endsWith("sap.css")
      ? "SAP narrow/zoom/print screenshots and browser assertions"
      : file.includes("ControlDrawer")
        ? "Drawing toolbar pixel/slider tests and screenshot"
        : file.endsWith("ai.scss")
          ? "AI preview/apply/discard/cancel browser fixture"
          : "Static review + builds; no claim of exhaustive visual/property testing",
  };
});
fs.writeFileSync(
  "docs/reui/full-audit/style-current.json",
  JSON.stringify(entries, null, 2) + "\n",
);
console.log(
  `${entries.length} style/static/build/config paths inventoried separately`,
);
