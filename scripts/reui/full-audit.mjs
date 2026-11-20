import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? walk(path.join(dir, e.name))
        : /\.[jt]sx?$/.test(e.name)
          ? [path.join(dir, e.name)]
          : [],
    );
const vendorSources = JSON.parse(
  fs.readFileSync("docs/reui/sources.json", "utf8"),
);
const vendorFiles = new Set(
  vendorSources.map((item) => `src/components/reui/${item.component}.tsx`),
);
const files = ["src", "playground/src"].flatMap(walk).sort();
const inventory = files.map((file) => {
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const tags = {},
    imports = [],
    findings = [],
    events = [],
    domSinks = [];
  const nativeAliases = new Map();
  function nativeTag(node) {
    if (
      ts.isStringLiteral(node) &&
      /^(button|input|select|textarea)$/.test(node.text)
    )
      return node.text;
    if (ts.isConditionalExpression(node))
      return nativeTag(node.whenTrue) || nativeTag(node.whenFalse);
  }
  function collect(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      const tag = nativeTag(node.initializer);
      if (tag) nativeAliases.set(node.name.text, tag);
    }
    ts.forEachChild(node, collect);
  }
  collect(source);
  const add = (node, kind, detail) =>
    findings.push({
      kind,
      detail,
      line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
    });
  function visit(node) {
    if (
      ts.isImportDeclaration(node) ||
      (ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier))
    ) {
      const module = node.moduleSpecifier.text;
      imports.push(module);
      if (
        (module.includes("radix") || module === "radix-ui") &&
        !vendorFiles.has(file)
      )
        add(node, "direct-radix", module);
      if (/components\/ui(?:\/|$)/.test(module))
        add(node, "legacy-ui-import", module);
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = node.tagName.getText(source);
      const tag = nativeAliases.get(name) || name;
      tags[tag] = (tags[tag] ?? 0) + 1;
      const attrs = node.attributes.properties.filter(ts.isJsxAttribute);
      const attrNames = attrs.map((a) => a.name.getText(source));
      for (const attr of attrNames.filter((a) => /^on[A-Z]/.test(a)))
        events.push({
          tag,
          event: attr,
          line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        });
      if (/^(button|input|select|textarea)$/.test(tag))
        add(node, "native-control", node.getText(source));
      if (
        /^(div|section|form)$/.test(tag) &&
        attrNames.includes("className") &&
        /richtext-bg-popover/.test(node.getText(source)) &&
        /richtext-shadow-/.test(node.getText(source))
      )
        add(node, "native-surface", node.getText(source));
      if (
        /Input$/.test(tag) &&
        /type=['\"](?:range|color|checkbox|radio)['\"]/.test(
          node.getText(source),
        )
      )
        add(node, "wrong-primitive", node.getText(source));
      if (
        /^(div|span|p|img|a)$/.test(tag) &&
        attrNames.some((a) => /^on(Click|MouseDown|PointerDown)$/.test(a))
      )
        add(node, "native-interaction", node.getText(source));
    }
    if (
      ts.isCallExpression(node) &&
      /(?:createElement|insertAdjacentHTML)$/.test(
        node.expression.getText(source),
      )
    ) {
      domSinks.push({
        expression: node.getText(source),
        line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
      });
      if (
        node.arguments.some(
          (arg) =>
            ts.isStringLiteral(arg) &&
            /^(button|input|select|textarea)$/.test(arg.text),
        )
      )
        add(node, "native-construction", node.getText(source));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return {
    file,
    sha256: crypto.createHash("sha256").update(text).digest("hex"),
    jsx: tags,
    imports,
    events,
    domSinks,
    documentSchema: /renderHTML|addNodeView/.test(text),
    findings,
  };
});
const target = process.argv.includes("--baseline")
  ? "docs/reui/full-audit/baseline.json"
  : "docs/reui/full-audit/current.json";
if (process.argv.includes("--baseline") && fs.existsSync(target))
  throw Error("Baseline is immutable; refuse overwrite");
fs.writeFileSync(target, JSON.stringify(inventory, null, 2) + "\n");
console.log(
  `${inventory.length} source modules, ${inventory.filter((f) => Object.keys(f.jsx).length).length} JSX modules; ${inventory.flatMap((f) => f.findings).length} review sites -> ${target}`,
);
if (process.argv.includes("--check")) {
  const expectedApi = JSON.parse(
    fs.readFileSync("docs/reui/full-audit/public-api.json", "utf8"),
  );
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  for (const key of ["exports", "typesVersions"])
    if (JSON.stringify(pkg[key]) !== JSON.stringify(expectedApi[key]))
      throw Error(`Public API changed: ${key}`);
  for (const file of vendorFiles) {
    const source = fs.readFileSync(file, "utf8");
    if (
      !source.includes(
        "Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf",
      )
    )
      throw Error(`Unverified vendor file: ${file}`);
  }
  const allow = JSON.parse(
    fs.readFileSync("scripts/reui/native-exceptions.json", "utf8"),
  );
  const unmatched = inventory
    .filter((f) => !vendorFiles.has(f.file))
    .flatMap((f) =>
      f.findings
        .filter(
          (v) =>
            !allow.some(
              (a) =>
                a.file === f.file &&
                a.kind === v.kind &&
                a.detail === v.detail &&
                a.reason,
            ),
        )
        .map((v) => ({ ...v, file: f.file })),
    );
  const stale = allow.filter(
    (a) =>
      !inventory.some(
        (f) =>
          f.file === a.file &&
          f.findings.some((v) => v.kind === a.kind && v.detail === a.detail),
      ),
  );
  if (unmatched.length || stale.length) {
    console.error(JSON.stringify({ unmatched, stale }, null, 2));
    process.exitCode = 1;
  } else
    console.log(
      `PASS: all business UI boundaries enforced; ${allow.length} exact, justified native exceptions`,
    );
}

await import("./style-audit.mjs");
