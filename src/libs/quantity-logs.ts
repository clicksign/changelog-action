export default function countLogsLastInRelease(
  oldLogs: string,
  wordFind: string
): number {
  const text = oldLogs.split('---')[0].split(wordFind)[1]
  const quantityLogsInLastRelease = (text.match(/- /g) || []).length
  return quantityLogsInLastRelease
}
