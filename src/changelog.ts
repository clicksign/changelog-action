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

    let finalLog = newLog

    let brancher = context.payload.ref
    if (brancher) {
      brancher = brancher.split('refs/heads/')[1]
      core.debug(`Current branch: ${brancher}`)
      const response = await toolkit.rest.pulls.list({
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: 'closed',
        base: brancher,
        sort: 'updated',
        direction: 'desc'
      })

      finalLog = `${newLog} - [#${response.data[0].number}](${response.data[0].html_url})`
    }

    const oldLogs = await getOldlogs({changelogFileName, encoding})
    const quantityLogs = countLogsLastInRelease(oldLogs, logFind)
    const logsSplit = oldLogs.split('\n')
    const release = newVersion(logsSplit[0])

    core.debug(`Current release: ${logsSplit[0]}`)
    core.debug(`Quantity logs in ${logsSplit[0]}: ${quantityLogs}`)

    // New Release
    if (quantityLogs >= maxLogs) {
      await createNewRelease({
        toolkit,
        context,
        logsSplit
      })

      await slackSend(payloadInjection, release, context.repo.repo)
    }

    const fullLogsWithLog = mountChangelogWithNewPR({
      newLog: finalLog,
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
