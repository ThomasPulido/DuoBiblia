"""Extract the project owner's Spanish Bible from the supplied PDF.

An internal comparison file is used only as a verse-boundary alignment guide.
Every word written to the output comes from ``Mi Biblia traducida.pdf``.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "OneDrive/Desktop/Mi Biblia traducida.pdf"
ALIGNMENT_PATH = ROOT / "content/verse-boundary-alignment.json"
OUTPUT_PATH = ROOT / "static/data/mi-biblia.json"

BOOK_START_PAGES = {
    "GEN": 5, "EXO": 33, "LEV": 56, "NUM": 73, "DEU": 97, "JOS": 117,
    "JDG": 131, "RUT": 145, "1SA": 147, "2SA": 165, "1KI": 180,
    "2KI": 198, "1CH": 215, "2CH": 231, "EZR": 251, "NEH": 257,
    "EST": 265, "JOB": 270, "PSA": 285, "PRO": 321, "ECC": 333,
    "SOL": 338, "ISA": 341, "JER": 368, "LAM": 399, "EZE": 402,
    "DAN": 430, "HOS": 439, "JOE": 443, "AMO": 445, "OBA": 449,
    "JON": 450, "MIC": 452, "NAH": 455, "HAB": 456, "ZEP": 458,
    "HAG": 460, "ZEC": 461, "MAL": 466, "MAT": 468, "MAR": 486,
    "LUK": 497, "JOH": 516, "ACT": 530, "ROM": 549, "1CO": 557,
    "2CO": 565, "GAL": 571, "EPH": 574, "PHI": 577, "COL": 579,
    "1TH": 581, "2TH": 583, "1TI": 584, "2TI": 587, "TIT": 589,
    "PHM": 590, "HEB": 591, "JAM": 597, "1PE": 599, "2PE": 602,
    "1JO": 604, "2JO": 607, "3JO": 608, "JUD": 609, "REV": 610,
}

# The supplied PDF follows an older chapter-boundary numbering in these places:
# the printed text continues under the next chapter and no separate number is
# printed for these canonical slots.
KNOWN_UNPRINTED_VERSES = {
    "NUM 12:16", "NUM 29:40", "1SA 23:29", "2SA 20:26", "2CH 33:25",
    "JOB 35:16", "JOB 38:39", "JOB 38:40", "JOB 38:41", "JOB 40:20",
    "JOB 40:21", "JOB 40:22", "JOB 40:23", "JOB 40:24", "HOS 11:12",
    "JON 1:17", "ZEC 11:17", "ACT 19:41", "2CO 13:14",
}

# This PDF numbers Zechariah 11 with 16 verses and folds the comparison
# edition's verse 16 into its verse 15. Its printed verse 16 is therefore a
# legitimate versification difference rather than truncated text.
KNOWN_VERSIFICATION_DIFFERENCES = {"ZEC 11:16"}

# Editorial headings that touch a verse because the supplied PDF numbers the
# surrounding passage differently. They are removed literally; no replacement
# Bible text is inserted.
KNOWN_TRAILING_HEADINGS = {"ZEC 11:16": "El luto por el traspasado"}

WORD_RE = re.compile(r"[^\W_]+(?:[’'][^\W_]+)?", re.UNICODE)
VERSE_MARKER_RE = re.compile(r"(?<!\d)(\d{1,3})(?=\s)")


def normalize_word(value: str) -> str:
    value = unicodedata.normalize("NFD", value.casefold())
    return "".join(char for char in value if unicodedata.category(char) != "Mn")


def word_matches(value: str):
    return list(WORD_RE.finditer(value))


def strip_chapter_outline(line: str, reference: str) -> str:
    """Turn a duplicated chapter/verse marker plus outline into verse 1.

    Some chapter openings begin with ``1 1`` followed by one or two editorial
    outline items. The second item is not always terminated with a period in
    the PDF (Ezekiel 15 is one example), so punctuation alone cannot reliably
    locate the biblical text. The comparison text locates only that boundary;
    the returned wording still comes from the user's PDF.
    """
    prefix = re.match(r"^1\s+1\s+", line)
    if not prefix:
        return line

    body = line[prefix.end():]
    body_words = word_matches(body)
    reference_tokens = [normalize_word(match.group()) for match in word_matches(reference)]
    body_tokens = [normalize_word(match.group()) for match in body_words]
    width = min(5, len(reference_tokens))
    for match_width in range(width, 2, -1):
        target = reference_tokens[:match_width]
        for index in range(0, len(body_tokens) - match_width + 1):
            if body_tokens[index:index + match_width] == target:
                return f"1 {body[body_words[index].start():]}"

    outline = re.match(r"^1\s+1\s+.+?\s+2\s+.+?\.\s*(.*)$", line)
    return f"1 {outline.group(1)}" if outline else line


def trim_to_reference(candidate: str, reference: str) -> tuple[str, float]:
    """Remove PDF headings around a verse while retaining PDF wording."""
    # Any digits left here are layout artefacts (page fragments or a verse
    # marker that follows the older numbering used by the supplied PDF). Verse
    # numbers are navigation metadata and are not part of the biblical text.
    candidate = re.sub(r"(?<!\w)\d{1,3}(?=\s|$)", "", candidate)
    candidate = re.sub(r"\s+", " ", candidate).strip()
    candidate_words = word_matches(candidate)
    reference_words = word_matches(reference)
    if not candidate_words or not reference_words:
        return candidate, 0.0

    source_tokens = [normalize_word(match.group()) for match in reference_words]
    candidate_tokens = [normalize_word(match.group()) for match in candidate_words]
    matcher = SequenceMatcher(None, source_tokens, candidate_tokens, autojunk=False)
    blocks = [block for block in matcher.get_matching_blocks() if block.size]
    if not blocks:
        return candidate, 0.0

    first = next((block for block in blocks if block.a <= 4 and block.size >= 2), blocks[0])
    last = next((block for block in reversed(blocks) if block.a + block.size >= len(source_tokens) - 4 and block.size >= 2), blocks[-1])
    start_word = max(0, first.b - first.a)
    trailing_source_words = len(source_tokens) - (last.a + last.size)
    end_word = min(len(candidate_words), last.b + last.size + trailing_source_words)
    if end_word <= start_word:
        return candidate, matcher.ratio()

    start_char = candidate_words[start_word].start()
    end_char = candidate_words[end_word - 1].end()
    while end_char < len(candidate) and candidate[end_char] in ".,;:!?)]}»”’\"":
        end_char += 1
    return candidate[start_char:end_char].strip(), matcher.ratio()


def extract_book_lines(pdf, start_page: int, end_page: int) -> list[str]:
    lines: list[str] = []
    for page_number in range(start_page, end_page + 1):
        page = pdf.pages[page_number - 1]
        midpoint = page.width / 2
        columns = (
            # The PDF page number sits around 35 px above the bottom edge. The
            # body finishes higher, so this cutoff prevents digits such as the
            # leading "5" of page 578 from entering a verse between columns.
            (20, 48, midpoint - 5, page.height - 40),
            (midpoint + 5, 48, page.width - 20, page.height - 40),
        )
        for bounds in columns:
            text = page.crop(bounds).extract_text(x_tolerance=1, y_tolerance=3) or ""
            lines.extend(line.strip() for line in text.splitlines() if line.strip())
    return lines


def parse_book(lines: list[str], reference_chapters: list, book_id: str) -> tuple[list, list[str]]:
    parsed = [None] + [[None] for _ in range(1, len(reference_chapters))]
    warnings: list[str] = []
    chapter = 0
    verse = 0
    buffer: list[str] = []

    last_nonempty = {
        chapter_number: max(
            (verse_number for verse_number, value in enumerate(reference_chapters[chapter_number] or []) if verse_number and value),
            default=0,
        )
        for chapter_number in range(1, len(reference_chapters))
    }

    def finish_verse():
        nonlocal buffer
        if chapter and verse:
            candidate = " ".join(buffer)
            reference = reference_chapters[chapter][verse] or ""
            reference_id = f"{book_id} {chapter}:{verse}"
            if reference_id in KNOWN_VERSIFICATION_DIFFERENCES:
                cleaned = re.sub(r"(?<!\w)\d{1,3}(?=\s|$)", "", candidate)
                cleaned = re.sub(r"\s+", " ", cleaned).strip()
                heading = KNOWN_TRAILING_HEADINGS.get(reference_id)
                if heading and cleaned.endswith(heading):
                    cleaned = cleaned[:-len(heading)].rstrip()
                ratio = 1.0
            else:
                cleaned, ratio = trim_to_reference(candidate, reference)
            parsed[chapter][verse] = cleaned
            if reference and ratio < 0.72:
                warnings.append(f"{chapter}:{verse} baja coincidencia ({ratio:.2f})")
        buffer = []

    for line_index, line in enumerate(lines):
        possible_chapter = chapter + 1
        # Some pages repeat a standalone "1" as a running column marker between
        # the chapter number and the actual first verse. Look a few lines ahead,
        # while still rejecting isolated page-number fragments inside a verse.
        next_line_starts_first_verse = any(
            re.match(r"^1\s+", following_line)
            for following_line in lines[line_index + 1:line_index + 4]
        )
        if (
            line == str(possible_chapter)
            and possible_chapter < len(reference_chapters)
            and (chapter == 0 or verse >= max(1, last_nonempty[chapter] - 1))
            and next_line_starts_first_verse
        ):
            finish_verse()
            chapter = possible_chapter
            verse = 0
            parsed[chapter] = [None] * len(reference_chapters[chapter])
            continue

        if not chapter:
            continue

        if verse == 0:
            # Some chapter openings carry a two-item outline on the same line
            # as verse 1, e.g. "1 1 Jesús y Nicodemo. 2 Nuevo testimonio...".
            # Remove that navigational outline before reading verse markers.
            line = strip_chapter_outline(line, reference_chapters[chapter][1] or "")

        cursor = 0
        for match in VERSE_MARKER_RE.finditer(line):
            number = int(match.group(1))
            if number != verse + 1 or number >= len(reference_chapters[chapter]):
                continue
            if verse:
                buffer.append(line[cursor:match.start()].strip())
                finish_verse()
            verse = number
            cursor = match.end()
        if verse:
            buffer.append(line[cursor:].strip())

    finish_verse()
    return parsed, warnings


def main():
    if not PDF_PATH.exists():
        raise SystemExit(f"No existe el PDF: {PDF_PATH}")
    if not ALIGNMENT_PATH.exists():
        raise SystemExit("Falta el archivo interno de límites de versículos.")

    alignment = json.loads(ALIGNMENT_PATH.read_text(encoding="utf8"))
    book_ids = list(BOOK_START_PAGES)
    output_books = {}
    all_warnings: list[str] = []

    with pdfplumber.open(PDF_PATH) as pdf:
        if len(pdf.pages) != 619:
            raise SystemExit(f"Se esperaban 619 páginas y el PDF tiene {len(pdf.pages)}.")
        for index, book_id in enumerate(book_ids):
            start_page = BOOK_START_PAGES[book_id]
            end_page = (BOOK_START_PAGES[book_ids[index + 1]] - 1) if index + 1 < len(book_ids) else 619
            reference_book = alignment["books"][book_id]
            lines = extract_book_lines(pdf, start_page, end_page)
            chapters, warnings = parse_book(lines, reference_book["chapters"], book_id)
            output_books[book_id] = {"name": reference_book["name"], "chapters": chapters}
            all_warnings.extend(f"{book_id} {warning}" for warning in warnings)
            extracted = sum(1 for chapter in chapters[1:] for value in (chapter or [])[1:] if value)
            expected = sum(1 for chapter in reference_book["chapters"][1:] for value in (chapter or [])[1:] if value)
            print(f"{book_id}: {extracted}/{expected} versículos con texto")

    verse_count = sum(
        1
        for book in output_books.values()
        for chapter in book["chapters"][1:]
        for value in (chapter or [])[1:]
        if value is not None
    )
    missing = [
        f"{book_id} {chapter_number}:{verse_number}"
        for book_id, book in output_books.items()
        for chapter_number, chapter in enumerate(book["chapters"])
        if chapter_number and chapter
        for verse_number, value in enumerate(chapter)
        if verse_number and value is None
    ]
    unexpected_missing = [reference for reference in missing if reference not in KNOWN_UNPRINTED_VERSES]
    if unexpected_missing:
        raise SystemExit(f"Faltan {len(unexpected_missing)} versículos inesperados: {', '.join(unexpected_missing[:20])}")
    for reference in missing:
        book_id, location = reference.split(" ")
        chapter_number, verse_number = (int(value) for value in location.split(":"))
        output_books[book_id]["chapters"][chapter_number][verse_number] = ""

    contaminated = [
        f"{book_id} {chapter_number}:{verse_number}"
        for book_id, book in output_books.items()
        for chapter_number, chapter in enumerate(book["chapters"])
        if chapter_number and chapter
        for verse_number, value in enumerate(chapter)
        if verse_number and value and re.search(r"\b\d{1,3}\b", value)
    ]
    if contaminated:
        raise SystemExit(f"Quedaron números de maquetación en: {', '.join(contaminated[:20])}")

    suspiciously_short = []
    for book_id, book in output_books.items():
        for chapter_number, chapter in enumerate(book["chapters"]):
            if not chapter_number or not chapter:
                continue
            for verse_number, value in enumerate(chapter):
                if not verse_number or not value:
                    continue
                reference_id = f"{book_id} {chapter_number}:{verse_number}"
                reference = alignment["books"][book_id]["chapters"][chapter_number][verse_number] or ""
                if reference_id not in KNOWN_VERSIFICATION_DIFFERENCES and len(word_matches(value)) < len(word_matches(reference)) * 0.55:
                    suspiciously_short.append(reference_id)
    if suspiciously_short:
        raise SystemExit(f"Versículos posiblemente truncados: {', '.join(suspiciously_short[:20])}")
    verse_count = sum(
        1
        for book in output_books.values()
        for chapter in book["chapters"][1:]
        for value in (chapter or [])[1:]
        if value is not None
    )
    if verse_count != 31102:
        raise SystemExit(f"Se esperaban 31.102 referencias y se extrajeron {verse_count}.")

    payload = {
        "meta": {
            "id": "mi-biblia-traducida",
            "title": "Mi Biblia traducida",
            "language": "es",
            "license": "Texto aportado y autorizado por el propietario del proyecto",
            "source": PDF_PATH.name,
            "sourceSha256": hashlib.sha256(PDF_PATH.read_bytes()).hexdigest(),
            "extraction": "Texto extraído directamente del PDF; saltos de línea normalizados",
            "verseCount": verse_count,
            "warningCount": len(all_warnings),
        },
        "books": output_books,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf8")
    warning_path = ROOT / "content/mi-biblia-extraction-warnings.txt"
    warning_path.write_text("\n".join(all_warnings), encoding="utf8")
    print(f"Mi Biblia integrada desde PDF: {verse_count} versículos -> {OUTPUT_PATH}")
    print(f"Advertencias de alineación: {len(all_warnings)} -> {warning_path}")


if __name__ == "__main__":
    main()
