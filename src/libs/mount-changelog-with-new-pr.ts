import {IMountLog} from '../interfaces'

import countLogsLastInRelease from './quantity-logs'
import newVersion from './version'

export default function mountChangelogWithNewPR({
  newLog,
  oldLogs,
  wordFind
}: IMountLog): string {
  const logsSplit = oldLogs.split('\n')

  if (logsSplit.length === 1) {
    return `${wordFind}\n- ${newLog}`
  }

  const firstIndexWord = logsSplit.findIndex((word, index) => {
    if (word === wordFind) {
      return index
    }
  })

  logsSplit[firstIndexWord] = `${wordFind}\n- ${newLog}`

  const quantityLogs = countLogsLastInRelease(oldLogs, wordFind)
  if (quantityLogs >= 4) {
    const releaseNewVersion = newVersion(logsSplit[0])
    const changelogWithNewVersion = `# v${releaseNewVersion}\n\n${wordFind}\n---\n\n${logsSplit[0]}`
    logsSplit[0] = changelogWithNewVersion
    const fullLogs = logsSplit.join('\n')
    return fullLogs
  }

  const fullLogs = logsSplit.join('\n')
  return fullLogs
}
