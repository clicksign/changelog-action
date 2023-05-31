import {IMountLog} from '../interfaces'

import newVersion from './version'

export default function mountChangelogWithNewPR({
  newLog,
  oldLogs,
  logFind,
  quantityLogs,
  maxLogs
}: IMountLog): string {
  const logsSplit = oldLogs.split('\n')

  if (logsSplit.length === 1) {
    return `${logFind}\n- ${newLog}`
  }

  const firstIndexWord = logsSplit.findIndex((word, index) => {
    if (word === logFind) {
      return index
    }
  })

  logsSplit[firstIndexWord] = `${logFind}\n- ${newLog}`

  if (quantityLogs >= maxLogs) {
    const releaseNewVersion = newVersion(logsSplit[0])
    const changelogWithNewVersion = `# v${releaseNewVersion}\n\n${logFind}\n---\n\n${logsSplit[0]}`
    logsSplit[0] = changelogWithNewVersion
    const fullLogs = logsSplit.join('\n')
    return fullLogs
  }

  const fullLogs = logsSplit.join('\n')
  return fullLogs
}
