import {  IMountLog } from '../interfaces'

export default function mountChangelogWithNewPR({newLog, oldLogs, wordFind}: IMountLog): string {
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
  const fullLogs = logsSplit.join('\n')
  return fullLogs
}
