/** Removes trailing blank lines (lines that are empty or whitespace-only). */
export function trimTrailingEmptyLines(text) {
  const lines = text.split("\n")
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop()
  }
  return lines.join("\n")
}
