export default function countLogsLastInRelease(
  oldLogs: string,
  logFind: string
): number {
  const text = oldLogs.split('---')[0].split(logFind)[1]
  const quantityLogsInLastRelease = (text.match(/- /g) || []).length
  return quantityLogsInLastRelease
}
