import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const spanish = JSON.parse(await readFile(resolve(root, "static/data/mi-biblia.json"), "utf8"));
const english = JSON.parse(await readFile(resolve(root, "static/data/kjv.json"), "utf8"));

// Curated for prayer, encouragement, wisdom, discipleship and the life of Jesus.
// Text is never typed here: both languages are extracted from the licensed Bible files.
const references = `
PSA:1:1 PSA:3:3 PSA:4:8 PSA:5:3 PSA:8:4 PSA:9:9 PSA:16:8 PSA:18:2 PSA:19:14 PSA:20:7
PSA:23:1 PSA:23:4 PSA:23:6 PSA:25:4 PSA:27:1 PSA:27:14 PSA:28:7 PSA:30:5 PSA:31:24 PSA:32:8
PSA:33:20 PSA:34:4 PSA:34:8 PSA:34:18 PSA:37:4 PSA:37:5 PSA:40:1 PSA:42:11 PSA:46:1 PSA:46:10
PSA:51:10 PSA:55:22 PSA:56:3 PSA:57:10 PSA:61:2 PSA:62:1 PSA:63:1 PSA:66:20 PSA:68:19 PSA:71:5
PSA:73:26 PSA:84:11 PSA:86:5 PSA:90:12 PSA:91:1 PSA:91:4 PSA:92:1 PSA:94:19 PSA:100:4 PSA:103:2
PSA:107:1 PSA:112:7 PSA:118:24 PSA:119:9 PSA:119:11 PSA:119:105 PSA:121:1 PSA:121:7 PSA:126:5 PSA:130:5
PSA:133:1 PSA:136:1 PSA:139:14 PSA:143:8 PSA:145:18 PSA:147:3
PRO:3:5 PRO:3:6 PRO:3:24 PRO:4:23 PRO:8:17 PRO:9:10 PRO:10:12 PRO:11:25 PRO:12:25 PRO:13:20
PRO:14:30 PRO:15:1 PRO:15:3 PRO:15:13 PRO:16:3 PRO:16:9 PRO:17:17 PRO:18:10 PRO:18:21 PRO:19:21
PRO:20:22 PRO:22:6 PRO:27:17 PRO:28:1 PRO:31:25 ECC:3:1 ECC:3:11 ECC:4:9
ISA:9:6 ISA:12:2 ISA:26:3 ISA:30:15 ISA:35:4 ISA:40:29 ISA:40:31 ISA:41:10 ISA:43:2 ISA:43:19
ISA:49:16 ISA:53:5 ISA:54:10 ISA:55:8 ISA:58:11 ISA:60:1 JER:1:5 JER:17:7 JER:29:11 JER:31:3
JER:33:3 LAM:3:22 LAM:3:23 LAM:3:25 EZE:36:26 DAN:3:17 DAN:6:23 HOS:6:3 JOE:2:13 MIC:6:8
NAH:1:7 HAB:2:4 HAB:3:19 ZEP:3:17 ZEC:4:6 MAL:3:10
MAT:5:6 MAT:5:9 MAT:5:14 MAT:5:16 MAT:6:6 MAT:6:21 MAT:6:26 MAT:6:33 MAT:7:7 MAT:7:12
MAT:11:28 MAT:16:24 MAT:18:20 MAT:19:26 MAT:22:37 MAT:22:39 MAT:28:6 MAT:28:20
MAR:5:36 MAR:8:34 MAR:9:23 MAR:10:27 MAR:11:24 MAR:12:30 MAR:12:31
LUK:1:37 LUK:1:46 LUK:1:49 LUK:2:10 LUK:2:11 LUK:2:14 LUK:6:31 LUK:10:27 LUK:11:28
LUK:12:32 LUK:15:20 LUK:18:1 LUK:19:10 LUK:22:42 LUK:24:6
JOH:1:5 JOH:1:14 JOH:3:16 JOH:4:24 JOH:6:35 JOH:8:12 JOH:10:10 JOH:10:14 JOH:11:25 JOH:13:34
JOH:14:1 JOH:14:6 JOH:14:27 JOH:15:5 JOH:15:9 JOH:15:12 JOH:16:33 JOH:19:30 JOH:20:29
ACT:1:8 ACT:2:21 ACT:4:12 ACT:4:31 ACT:16:31 ACT:17:28 ACT:20:35
ROM:1:16 ROM:5:1 ROM:5:5 ROM:5:8 ROM:8:1 ROM:8:18 ROM:8:28 ROM:8:31 ROM:8:37 ROM:10:9
ROM:12:2 ROM:12:12 ROM:12:18 ROM:15:13
1CO:1:9 1CO:3:16 1CO:6:19 1CO:10:13 1CO:13:4 1CO:13:7 1CO:13:13 1CO:15:20 1CO:15:58 1CO:16:14
2CO:1:3 2CO:3:17 2CO:4:7 2CO:4:16 2CO:5:7 2CO:5:17 2CO:9:7 2CO:12:9
GAL:2:20 GAL:5:1 GAL:5:13 GAL:5:22 GAL:6:9
EPH:2:8 EPH:2:10 EPH:3:20 EPH:4:2 EPH:4:32 EPH:5:2 EPH:6:10
PHI:1:6 PHI:1:21 PHI:2:3 PHI:2:5 PHI:3:13 PHI:4:4 PHI:4:6 PHI:4:8 PHI:4:13 PHI:4:19
COL:1:13 COL:2:7 COL:3:2 COL:3:13 COL:3:15 COL:3:17 COL:3:23
1TH:5:11 1TH:5:16 1TH:5:17 1TH:5:18 1TH:5:21 2TH:3:3 2TH:3:16
1TI:4:12 1TI:6:6 1TI:6:12 2TI:1:7 2TI:2:1 2TI:3:16 2TI:4:7
TIT:2:11 TIT:3:5 PHM:1:7
HEB:4:12 HEB:4:16 HEB:10:23 HEB:11:1 HEB:11:6 HEB:12:1 HEB:12:2 HEB:13:5 HEB:13:8
JAM:1:2 JAM:1:5 JAM:1:12 JAM:1:17 JAM:1:19 JAM:1:22 JAM:4:8 JAM:5:16
1PE:1:3 1PE:2:9 1PE:3:15 1PE:4:8 1PE:5:7 1PE:5:10 2PE:1:3 2PE:3:9
1JO:1:9 1JO:3:1 1JO:3:18 1JO:4:4 1JO:4:8 1JO:4:18 1JO:4:19 1JO:5:4
2JO:1:6 3JO:1:4 JUD:1:24 REV:3:20 REV:21:4 REV:21:5 REV:22:5 REV:22:20
`.trim().split(/\s+/);

function extract(reference) {
  const [bookId, chapterText, verseText] = reference.split(":");
  const chapter = Number(chapterText);
  const verse = Number(verseText);
  const esBook = spanish.books?.[bookId];
  const enBook = english.books?.[bookId];
  const es = esBook?.chapters?.[chapter]?.[verse];
  const en = enBook?.chapters?.[chapter]?.[verse];
  if (!es || !en) throw new Error(`Referencia incompleta: ${reference}`);
  return {
    key: reference,
    book: { id: bookId, es: esBook.name.es, en: enBook.name.en },
    chapter,
    verse,
    reference: { es: `${esBook.name.es} ${chapter}:${verse}`, en: `${enBook.name.en} ${chapter}:${verse}` },
    es,
    en
  };
}

const verses = Object.fromEntries(references.map((reference) => [reference, extract(reference)]));
const span = references.length;
const days = Array.from({ length: 365 }, (_, index) => ({
  day: index + 1,
  morning: references[index % span],
  afternoon: references[(index + Math.floor(span / 3)) % span],
  night: references[(index + Math.floor(span * 2 / 3)) % span]
}));

await writeFile(resolve(root, "src/annual-prayer-calendar.json"), `${JSON.stringify({ verseCount: span, verses, days })}\n`, "utf8");
console.log(`Calendario de oración: 365 días, ${span} versículos bíblicos exactos.`);
