// Rebuilds the on-site folio preview from the PDF.
// Usage: npm run folio [path/to/new.pdf] [--single] [--skip=2,29]
// With a path, that file replaces public/folio.pdf first. Then every page is rendered to WebP
// (public/folio/NN-800.<hash>.webp and NN-1600.<hash>.webp) and the names go to src/data/folio.json.
// The PDF is laid out as double-page spreads, so each page is cut into a left and a right half and
// the viewer shows the halves as separate pages. Pass --single for a PDF with one page per sheet.
// --skip=2,29 leaves out those images (numbered as in the full split, 1-based), e.g. blank halves.
// Needs poppler (pdftoppm, pdftotext, pdfinfo) on PATH. Run locally and commit the results.
// @ts-check
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const pdf = join(root, "public", "folio.pdf");
const out = join(root, "public", "folio");
const staging = `${out}.tmp`; // images are written here first and swapped in only when the whole run succeeded
const data = join(root, "src", "data", "folio.json");
const WIDTHS = [800, 1600];

const SPLIT = process.argv.includes("--single") ? 1 : 2; // images per PDF page
const skip = new Set((process.argv.find((a) => a.startsWith("--skip=")) ?? "").slice(7).split(",").filter(Boolean).map(Number));
const given = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (given) copyFileSync(resolve(given), pdf);
if (!existsSync(pdf)) throw new Error(`Missing ${pdf}. Pass the PDF path: npm run folio path/to/file.pdf`);

/** @param {string} cmd @param {string[]} args */
const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const info = run("pdfinfo", [pdf]);
const pages = Number(/^Pages:\s+(\d+)/m.exec(info)?.[1]);
const size = /^Page size:\s+([\d.]+) x ([\d.]+)/m.exec(info);
if (!pages || !size) throw new Error("Could not read page count or size from pdfinfo");
const pageW = Number(size[1]);
const pageH = Number(size[2]);
const ratio = pageW / SPLIT / pageH;
for (const n of skip)
  if (!Number.isInteger(n) || n < 1 || n > pages * SPLIT)
    throw new Error(`--skip: ${n} is not an image number between 1 and ${pages * SPLIT}`);

const tmp = mkdtempSync(join(tmpdir(), "folio-"));
try {
  run("pdftoppm", ["-png", "-scale-to-x", String(Math.max(...WIDTHS) * SPLIT), "-scale-to-y", "-1", pdf, join(tmp, "p")]);
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  const files = readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
  if (files.length !== pages) throw new Error(`Rendered ${files.length} pages, expected ${pages}`);
  const text = [];
  const names = []; // per image: { [width]: file name }; the name carries a content hash, so /folio/* can be cached for good
  let n = 0;
  let seen = 0; // position in the full split, before skipping
  for (const [i, f] of files.entries()) {
    const page = sharp(join(tmp, f));
    const meta = await page.metadata();
    const w = Math.floor(meta.width / SPLIT);
    for (let h = 0; h < SPLIT; h++) {
      if (skip.has(++seen)) continue;
      n++;
      const name = String(n).padStart(2, "0");
      /** @type {Record<number, string>} */
      const entry = {};
      for (const width of WIDTHS) {
        const buf = await page
          .clone()
          .extract({ left: h * w, top: 0, width: w, height: meta.height })
          .resize({ width })
          .webp({ quality: 82 })
          .toBuffer();
        const file = `${name}-${width}.${createHash("sha1").update(buf).digest("hex").slice(0, 8)}.webp`;
        writeFileSync(join(staging, file), buf);
        entry[width] = file;
      }
      names.push(entry);
      // text of this half only: crop in points (-r 72 makes pixels equal points)
      const half = pageW / SPLIT;
      text.push(
        run("pdftotext", ["-f", String(i + 1), "-l", String(i + 1), "-r", "72", "-x", String(Math.round(h * half)), "-y", "0", "-W", String(Math.round(half)), "-H", String(Math.round(pageH)), pdf, "-"])
          .replace(/\s+/g, " ")
          .trim(),
      );
    }
  }
  rmSync(out, { recursive: true, force: true });
  renameSync(staging, out);
  mkdirSync(join(root, "src", "data"), { recursive: true });
  writeFileSync(data, JSON.stringify({ pages: n, ratio: Number(ratio.toFixed(4)), widths: WIDTHS, files: names }, null, 2) + "\n");
  // The page text is not published (it is garbled by the PDF's letter-spaced titles; alt text is hand-written in
  // src/data/folio-captions.json, one line per image: update it when the PDF changes). It is only checked here.
  const flat = text.join(" ");
  if (/(\+?\d[\d ()-]{7,}\d)|([\w.+-]+@[\w-]+\.[\w.]+)/.test(flat))
    console.warn("folio: WARNING the PDF text contains something that looks like a phone number or email. Check before publishing.");
  const captions = JSON.parse(readFileSync(join(root, "src", "data", "folio-captions.json"), "utf8"));
  if (captions.length !== n) console.warn(`folio: WARNING src/data/folio-captions.json has ${captions.length} captions for ${n} images.`);
  console.log(`folio: ${pages} PDF pages -> ${n} images, ratio ${ratio.toFixed(2)}, written to public/folio and src/data/folio.json`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
  rmSync(staging, { recursive: true, force: true });
}
