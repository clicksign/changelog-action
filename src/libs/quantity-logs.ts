import * as core from '@actions/core'

export default function countLogsLastInRelease(
  oldLogs: string,
  wordFind: string
): number {
  const text = oldLogs.split('---')[0].split(wordFind)[1]
  core.debug(`Word find ${wordFind}`)
  core.debug(`Text quantity ${text}`)
  const quantityLogsInLastRelease = (text.match(/- /g) || []).length
  return quantityLogsInLastRelease
}
