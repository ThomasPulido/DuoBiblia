import { books } from "./core.mjs";

export const BIBLE_VERSIONS = {
  kjv: { id: "kjv", label: "KJV", language: "en", file: "kjv.json" },
  "mi-biblia": { id: "mi-biblia", label: "Mi Biblia", language: "es", file: "mi-biblia.json" }
};

const biblePromises = new Map();

export function loadBible(version = "kjv") {
  const config = BIBLE_VERSIONS[version] || BIBLE_VERSIONS.kjv;
  if (!biblePromises.has(config.id)) {
    biblePromises.set(config.id, fetch(`./data/${config.file}`).then((response) => {
      if (!response.ok) throw new Error(`No fue posible abrir ${config.label} (${response.status}).`);
      return response.json();
    }));
  }
  return biblePromises.get(config.id);
}

export async function getBibleChapter(version, bookId, chapter) {
  const bible = await loadBible(version);
  const verses = bible.books[bookId]?.chapters?.[chapter];
  if (!verses) throw new Error("El capítulo solicitado no está disponible.");
  return verses;
}

export async function searchBible(version, query, limit = 40) {
  const config = BIBLE_VERSIONS[version] || BIBLE_VERSIONS.kjv;
  const bible = await loadBible(config.id);
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  const results = [];
  for (const book of books) {
    const sourceBook = bible.books[book.id];
    for (let chapter = 1; chapter < sourceBook.chapters.length; chapter += 1) {
      const verses = sourceBook.chapters[chapter] || [];
      for (let verse = 1; verse < verses.length; verse += 1) {
        const value = verses[verse];
        const reference = `${book[config.language]} ${chapter}:${verse}`;
        if (`${reference} ${book.es} ${value}`.toLocaleLowerCase().includes(normalized)) {
          results.push({ bookId: book.id, book, chapter, verse, text: value, reference, version: config.id });
          if (results.length >= limit) return results;
        }
      }
    }
  }
  return results;
}

export const loadKjvBible = () => loadBible("kjv");
export const getKjvChapter = (bookId, chapter) => getBibleChapter("kjv", bookId, chapter);
export const searchKjv = (query, limit) => searchBible("kjv", query, limit);
