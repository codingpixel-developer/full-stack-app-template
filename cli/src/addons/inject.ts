export class MarkerNotFoundError extends Error {
  constructor(
    public readonly file: string,
    public readonly marker: string,
  ) {
    super(
      `Marker "${marker}" not found in ${file}. Restore the marker line, then run the CLI again.`,
    );
  }
}

export function injectAtMarker(
  content: string,
  file: string,
  marker: string,
  line: string,
): string {
  const lines = content.split('\n');
  const index = lines.findIndex((l) => l.trim() === marker);
  if (index === -1) throw new MarkerNotFoundError(file, marker);
  if (lines.some((l) => l.trim() === line.trim())) return content;
  const indent = lines[index].match(/^\s*/)?.[0] ?? '';
  lines.splice(index, 0, `${indent}${line.trim()}`);
  return lines.join('\n');
}
