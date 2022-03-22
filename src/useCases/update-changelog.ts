import * as core from '@actions/core'

import {IUpdateChangelog} from '../interfaces'
import fs from 'fs'
import mountChangelogWithNewPR from '../libs/mount-changelog-with-new-pr'
import path from 'path'

const fsPromises = fs.promises

export default async function updateChangelog({
  toolkit,
  context,
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

    const file = [
      {
        mode: '100644',
        path: 'CHANGELOG.md',
        content: fullLogsWithLog
      }
    ]

    const commits = await toolkit.rest.repos.listCommits({...context.repo})

    const latestCommitSHA = commits.data[0].sha

    const {
      data: {sha: newTreeSha}
    } = await toolkit.rest.git.createTree({
      ...context.repo,
      tree: file,
      base_tree: latestCommitSHA
    })

    const {
      data: {sha: newCommitSHA}
    } = await toolkit.rest.git.createCommit({
      ...context.repo,
      tree: newTreeSha,
      parents: [latestCommitSHA],
      message: 'action: atualizando changelog'
    })

    await toolkit.rest.git.updateRef({
      ...context.repo,
      sha: newCommitSHA,
      ref: `heads/main`,
      force: true
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}
