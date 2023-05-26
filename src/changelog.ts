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
  maxLogs,
  createReleaseWitBracherHistory
}: IChangeLog): Promise<void> {
  if (createReleaseWitBracherHistory === 'true') {
    core.debug(context.ref)
    return
  }

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

    // New Release
    core.debug(createReleaseWitBracherHistory)
    if (quantityLogs >= maxLogs) {
      await createNewRelease({
        toolkit,
        context,
        logsSplit
      })

      await slackSend(payloadInjection, release, context.repo.repo)
    }

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
  } catch (e: any) {
    throw new Error(e.message)
  }
}
