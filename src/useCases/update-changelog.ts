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

    let response = await toolkit.rest.repos.listCommits({
      ...context.repo,
      sha: sha || context.sha,
      per_page: 1
    })

    const latestCommitSha = response.data[0].sha
    const treeSha = response.data[0].commit.tree.sha

    response = await toolkit.rest.git.createTree({
      ...context.repo,
      tree: [
        {
          mode: '100644',
          path: 'CHANGELOG.md',
          content: 'udpate changelog'
        }
      ],
      base_tree: treeSha
    })
    const newTreeSha = response.data.sha

    const {
      data: {sha: newCommitSHA}
    } = await toolkit.rest.git.createCommit({
      ...context.repo,
      tree: newTreeSha,
      parents: [latestCommitSha],
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
