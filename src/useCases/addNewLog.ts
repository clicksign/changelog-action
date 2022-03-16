import fs from 'fs'
import path from 'path'
import * as core from '@actions/core'

import getOldlogs from "../libs/getOldLogs"
import mountChangelogWithNewPR from "../libs/mountChangelogWithNewPR"

import { IChangeLog } from '../interfaces'

const fsPromises = fs.promises

export default async function addNewLog({
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
      const fullLogsWithComment = mountChangelogWithNewPR({
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

    const fullLogsWithLog = mountChangelogWithNewPR({
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
