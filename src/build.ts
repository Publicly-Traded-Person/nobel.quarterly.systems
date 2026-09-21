// Placeholder build. The real generator replaces this file.
import { mkdir, writeFile } from "node:fs/promises";

const out = "dist";
await mkdir(out, { recursive: true });
await writeFile(
  `${out}/index.html`,
  `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KmikeyM Covers the Econ Nobel</title>
<style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;line-height:1.5}</style>
</head><body>
<h1>KmikeyM Covers the Econ Nobel</h1>
<p>The Power Rankings are being built. First update: Clarivate named four on September 17, 2026.</p>
</body></html>
`,
);
console.log(`wrote ${out}/index.html`);
