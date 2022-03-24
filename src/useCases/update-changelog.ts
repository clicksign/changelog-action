import * as core from '@actions/core'

import {IUpdateChangelog} from '../interfaces'
import mountChangelogWithNewPR from '../libs/mount-changelog-with-new-pr'

export default async function updateChangelog({
  toolkit,
  context,
  changelogFileName,
  newLog,
  logFind,
  oldLogs,
  quantityLogs,
  repoMain
}: IUpdateChangelog): Promise<any> {
  try {
    const fullLogsWithLog = mountChangelogWithNewPR({
      newLog,
      oldLogs,
      logFind,
      quantityLogs
    })

    const file = [
      {
        mode: '100644',
        path: changelogFileName,
        content: fullLogsWithLog
      }
    ]

    const commits = await toolkit.rest.repos.listCommits({
      ...context.repo
    })

    const latestCommitSHA = commits.data[0].sha
    core.debug(`Last commit sha: ${latestCommitSHA}`)

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
    core.debug(`New commit sha: ${newCommitSHA}`)

    await toolkit.rest.git.updateRef({
      ...context.repo,
      sha: newCommitSHA,
      ref: repoMain,
      force: true
    })

    return newCommitSHA
  } catch (e: any) {
    throw new Error(e.message)
  }
}
