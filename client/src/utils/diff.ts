export interface DiffHunk {
  content: string;
  isAdd: boolean;
  isRemove: boolean;
  isContext: boolean;
  isHeader: boolean;
}

export function parseDiff(rawDiff: string): DiffHunk[] {
  if (!rawDiff) return [];
  const lines = rawDiff.split('\n');
  const hunks: DiffHunk[] = [];

  for (const line of lines) {
    if (
      line.startsWith('@@ ') ||
      line.startsWith('diff --git') ||
      line.startsWith('index ') ||
      line.startsWith('--- ') ||
      line.startsWith('+++ ')
    ) {
      hunks.push({ content: line, isHeader: true, isAdd: false, isRemove: false, isContext: false });
    } else if (line.startsWith('+')) {
      hunks.push({ content: line, isHeader: false, isAdd: true, isRemove: false, isContext: false });
    } else if (line.startsWith('-')) {
      hunks.push({ content: line, isHeader: false, isAdd: false, isRemove: true, isContext: false });
    } else {
      hunks.push({ content: line, isHeader: false, isAdd: false, isRemove: false, isContext: true });
    }
  }

  return hunks;
}
