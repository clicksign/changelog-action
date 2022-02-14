import fs from 'fs'
import path from 'path'
import * as core from '@actions/core'

import {IChangeLog, IGetOldLogs, IMountLog} from './interfaces'

const fsPromises = fs.promises

export const getOldlogs = async ({
  changelogFileName,
  encoding
}: IGetOldLogs): Promise<string> => {
  try {
    const buf = await fsPromises.readFile(changelogFileName, encoding)
    const oldLogs = buf.toString(encoding)
    return oldLogs
  } catch (error) {
    throw new Error('Changelog not found')
  }
}

export const mountLog = ({newLog, oldLogs, wordFind}: IMountLog): string => {
  const logsSplit = oldLogs.split('\n')

  if (logsSplit.length === 1) {
    logsSplit[1] = `\n- ${newLog}`
    const fullLogs = logsSplit.join('\n')
    return fullLogs
  }

  const firstIndexWord = logsSplit.findIndex((word, index) => {
    if (word === wordFind) {
      return index
    }
  })
  console.log(firstIndexWord)

  logsSplit[firstIndexWord + 1] = `\n- ${newLog}`
  const fullLogs = logsSplit.join('\n')
  return fullLogs
}

export default async function changelog({
  changelogFileName,
  newLog,
  newComments,
  logFind,
  commentFind,
  encoding
}: IChangeLog): Promise<void> {
  try {
    core.debug(`File add log ${changelogFileName}`)

    const oldLogs = await getOldlogs({changelogFileName, encoding})

    if (newComments?.length) {
      const fullLogsWithComment = mountLog({
        newLog: newComments,
        oldLogs,
        wordFind: commentFind
      })

      core.debug(`New comments add ${newComments}`)

      await fsPromises.writeFile(
        path.resolve(changelogFileName),
        fullLogsWithComment,
        encoding
      )
    }

    const fullLogsWithLog = mountLog({
      newLog,
      oldLogs,
      wordFind: logFind
    })

    core.debug(`New log add ${newLog}`)

    await fsPromises.writeFile(
      path.resolve(changelogFileName),
      fullLogsWithLog,
      encoding
    )
  } catch (e: any) {
    throw new Error(e.message)
  }
}
