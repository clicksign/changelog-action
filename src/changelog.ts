import {getOctokit, context} from '@actions/github'
import * as core from '@actions/core'

import {IChangeLog} from './interfaces'
import updateChangelog from './useCases/update-changelog'
import createNewRelease from './useCases/create-new-release'
import countLogsLastInRelease from './libs/quantity-logs'
import getOldlogs from './libs/get-old-logs'
import mountChangelogWithNewPR from './libs/mount-changelog-with-new-pr'
import slackSend from './useCases/slack-send'
import newVersion from './libs/version'

function githubToken(): string {
  const token = process.env.GITHUB_TOKEN
  if (!token)
    throw ReferenceError('No token defined in the environment variables')
  return token
}

export default async function changelog({
  changelogFileName,
  newLog,
  logFind,
  encoding,
  repoMain,
  payloadInjection
}: IChangeLog): Promise<void> {
  try {
    core.debug(`Name File: ${changelogFileName}`)
    core.debug(`Initial log find: ${logFind}`)
    core.debug(`New log add: ${newLog}`)

    const toolkit = getOctokit(githubToken())

    const oldLogs = await getOldlogs({changelogFileName, encoding})
    const quantityLogs = countLogsLastInRelease(oldLogs, logFind)
    const logsSplit = oldLogs.split('\n')

    core.debug(`Current release: ${logsSplit[0]}`)
    core.debug(`Quantity logs in ${logsSplit[0]}: ${quantityLogs}`)

    const fullLogsWithLog = mountChangelogWithNewPR({
      newLog,
      oldLogs,
      logFind,
      quantityLogs
    })

    const modeID = '100644'

    const fileMain = [
      {
        mode: modeID,
        path: changelogFileName,
        content: fullLogsWithLog
      }
    ]

    await updateChangelog({
      toolkit,
      context,
      file: fileMain,
      repoMain
    })

    // New Release
    if (quantityLogs >= 4) {
      const fullLogsNewRelase = mountChangelogWithNewPR({
        newLog,
        oldLogs,
        logFind,
        quantityLogs: 0
      })

      const fileRelease = [
        {
          mode: modeID,
          path: changelogFileName,
          content: fullLogsNewRelase
        }
      ]

      await createNewRelease({
        toolkit,
        context,
        file: fileRelease,
        logsSplit
      })

      const release = newVersion(logsSplit[0])

      await slackSend(payloadInjection, release)
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}
