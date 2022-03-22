import * as core from '@actions/core'

import {IUpdateChangelog} from '../interfaces'
import fs from 'fs'
import mountChangelogWithNewPR from '../libs/mount-changelog-with-new-pr'
import path from 'path'

const fsPromises = fs.promises

export default async function updateChangelog({
  toolkit,
  context,
  sha,
  changelogFileName,
  newLog,
  newComments,
  logFind,
  commentFind,
  encoding,
  oldLogs,
  quantityLogs
}: IUpdateChangelog): Promise<void> {
  try {
    if (newComments?.length) {
      const fullLogsWithComment = mountChangelogWithNewPR({
        newLog: newComments,
        oldLogs,
        logFind: commentFind,
        quantityLogs
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
      logFind,
      quantityLogs
    })

    await fsPromises.writeFile(
      path.resolve(changelogFileName),
      fullLogsWithLog,
      encoding
    )

    await toolkit.rest.git.createCommit({
      ...context.repo,
      tree: sha || context.sha,
      message: "action: atualizando changelog",
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}
