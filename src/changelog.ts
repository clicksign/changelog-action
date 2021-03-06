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
import mountSha from './libs/mount-sha'

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
  payloadInjection,
  maxLogs
}: IChangeLog): Promise<void> {
  try {
    core.debug(`Name File: ${changelogFileName}`)
    core.debug(`Initial log find: ${logFind}`)
    core.debug(`New log add: ${newLog}`)

    const toolkit = getOctokit(githubToken())

    const oldLogs = await getOldlogs({changelogFileName, encoding})
    const quantityLogs = countLogsLastInRelease(oldLogs, logFind)
    const logsSplit = oldLogs.split('\n')
    const release = newVersion(logsSplit[0])

    core.debug(`Current release: ${logsSplit[0]}`)
    core.debug(`Quantity logs in ${logsSplit[0]}: ${quantityLogs}`)

    const fullLogsWithLog = mountChangelogWithNewPR({
      newLog,
      oldLogs,
      logFind,
      quantityLogs,
      maxLogs
    })

    const modeID = '100644'

    const file = [
      {
        mode: modeID,
        path: changelogFileName,
        content: fullLogsWithLog
      }
    ]

    if (quantityLogs >= maxLogs) {
      file[1] = {
        mode: modeID,
        path: 'REVISION',
        content: release
      }
    }

    const newCommitSHA = await mountSha({
      toolkit,
      context,
      file,
      repoMain
    })

    await updateChangelog({
      toolkit,
      context,
      newCommitSHA,
      repoMain
    })

    // New Release
    if (quantityLogs >= maxLogs) {
      const fullLogsNewRelase = mountChangelogWithNewPR({
        newLog,
        oldLogs,
        logFind,
        quantityLogs: 0,
        maxLogs
      })
      const releaseSplit = release.split('.')
      releaseSplit[1] = (parseInt(releaseSplit[1]) - 1).toString()
      const releaseCurrentVersion = releaseSplit.join('.')

      const fileRelease = [
        {
          mode: modeID,
          path: changelogFileName,
          content: fullLogsNewRelase
        },
        {
          mode: modeID,
          path: 'REVISION',
          content: releaseCurrentVersion
        }
      ]

      const newCommitSHARelease = await mountSha({
        toolkit,
        context,
        file: fileRelease,
        repoMain
      })

      await createNewRelease({
        toolkit,
        context,
        newCommitSHA: newCommitSHARelease,
        logsSplit
      })

      await slackSend(payloadInjection, release)
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}
