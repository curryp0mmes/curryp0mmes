#!/usr/bin/env node

/**
 * Automatically compiles all SVG files in website/logo/SVG/
 * into website/logo/js/svg-data.js so the logo generator works
 * standalone (GitHub Pages, offline, file://) with zero manual maintenance.
 */

const fs = require("fs");
const path = require("path");

const logoDir = path.resolve(__dirname, "..");
const svgDir = path.join(logoDir, "SVG");
const outJs = path.join(logoDir, "js", "svg-data.js");

if (!fs.existsSync(svgDir)) {
  console.error("SVG directory not found: " + svgDir);
  process.exit(1);
}

const svgFiles = fs.readdirSync(svgDir).filter((file) => file.endsWith(".svg")).sort();
const svgData = {};

for (const file of svgFiles) {
  const filePath = path.join(svgDir, file);
  svgData[file] = fs.readFileSync(filePath, "utf8");
}

const jsContent = "/**\n * Auto-generated SVG Data Bundle\n * Generated from website/logo/SVG/ by scripts/build-svg-data.js\n * DO NOT EDIT MANUALLY - run node website/logo/scripts/build-svg-data.js to update.\n */\n\nvar SVG_DATA = " + JSON.stringify(svgData, null, 2) + ";\n\nif (typeof window !== \"undefined\") {\n  window.SVG_DATA = SVG_DATA;\n}\nif (typeof globalThis !== \"undefined\") {\n  globalThis.SVG_DATA = SVG_DATA;\n}\n";

fs.writeFileSync(outJs, jsContent, "utf8");
console.log("Successfully compiled " + svgFiles.length + " SVGs into " + path.relative(process.cwd(), outJs));
