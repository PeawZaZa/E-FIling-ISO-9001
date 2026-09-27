"use strict";

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, ".chapter3-figures");
const names = ["use-case-unified", "er-conceptual-unified", "dar-ack-workflow", "car-ncr-workflow"];

(async () => {
  for (const name of names) {
    const html = fs.readFileSync(path.join(root, `${name}.html`), "utf8");
    const match = html.match(/<svg\b[\s\S]*?<\/svg>/);
    if (!match) throw new Error(`Missing SVG in ${name}`);
    await sharp(Buffer.from(match[0]), { density: 300 })
      .png({ compressionLevel: 6 })
      .toFile(path.join(root, `${name}.png`));
    console.log(`Exported ${name}.png`);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
