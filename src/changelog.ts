import {getOctokit, context} from '@actions/github'
import * as core from '@actions/core'

import {IChangeLog} from './interfaces'
import updateChangelog from './useCases/update-changelog'
import createNewRelease from './useCases/create-new-release'
import countLogsLastInRelease from './libs/quantity-logs'
import getOldlogs from './libs/get-old-logs'

export default async function changelog({
  changelogFileName,
  newLog,
  newComments,
  logFind,
  commentFind,
  encoding
}: IChangeLog): Promise<void> {
  try {
    core.debug(`Name File: ${changelogFileName}`)
    core.debug(`Initial log find: ${logFind}`)
    core.debug(`New log add: ${newLog}`)

    const sha = core.getInput('sha')

    const oldLogs = await getOldlogs({changelogFileName, encoding})
    const quantityLogs = countLogsLastInRelease(oldLogs, logFind)
    const logsSplit = oldLogs.split('\n')

    core.debug(`Current release: ${logsSplit[0]}`)
    core.debug(`Quantity logs in ${logsSplit[0]}: ${quantityLogs}`)

    // TODOL send quantity log, oldlogs, logSplit
    await updateChangelog({
      changelogFileName,
      newLog,
      newComments,
      logFind,
      commentFind,
      encoding,
      oldLogs,
      quantityLogs
    })

    if (quantityLogs >= 4) {
      await createNewRelease({
        getOctokit,
        context,
        sha,
        logsSplit
      })
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}
