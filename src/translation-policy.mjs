export function selectionWords(value = "") {
  return String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function translationMode(value = "") {
  const count = selectionWords(value).length;
  if (!count) return "empty";
  return count <= 2 ? "literal" : "parallel-passage";
}

