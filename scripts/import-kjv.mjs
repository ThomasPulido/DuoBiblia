import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { books } from "../src/core.mjs";

const source = resolve("content/kjv-source/eng-kjv2006_vpl.txt");
const output = resolve("static/data/kjv.json");
const raw = await readFile(source, "utf8");
const byId = Object.fromEntries(books.map((book) => [book.id, {
  name: { es: book.es, en: book.en },
  chapters: Array.from({ length: book.chapters + 1 }, () => null)
}]));

let verseCount = 0;
for (const line of raw.split(/\r?\n/)) {
  if (!line.trim()) continue;
  const match = line.match(/^([1-3]?[A-Z]{2,3}) (\d+):(\d+) (.+)$/);
  if (!match) throw new Error(`Línea VPL no reconocida: ${line.slice(0, 80)}`);
  const [, bookId, chapterText, verseText, text] = match;
  const book = byId[bookId];
  if (!book) throw new Error(`Libro KJV no contemplado: ${bookId}`);
  const chapter = Number(chapterText);
  const verse = Number(verseText);
  if (!book.chapters[chapter]) book.chapters[chapter] = [null];
  book.chapters[chapter][verse] = text.trim();
  verseCount += 1;
}

if (verseCount !== 31102) throw new Error(`Se esperaban 31.102 versículos KJV y se encontraron ${verseCount}.`);

const payload = {
  meta: {
    id: "eng-kjv2006",
    title: "King James (Authorized) Version",
    edition: "Standardized 1769 text",
    license: "Public Domain outside the United Kingdom",
    source: "https://ebible.org/find/details.php?id=eng-kjv2006",
    importedFrom: "eng-kjv2006_vpl.txt",
    sourceSha256: createHash("sha256").update(raw).digest("hex"),
    verseCount
  },
  books: byId
};

await mkdir(resolve("static/data"), { recursive: true });
await writeFile(output, JSON.stringify(payload), "utf8");
console.log(`KJV completa integrada: ${verseCount.toLocaleString("es-CO")} versículos -> ${output}`);
