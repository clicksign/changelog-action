import * as core from '@actions/core'

import {IUpdateChangelog} from '../interfaces'

export default async function updateChangelog({
  toolkit,
  context,
  file,
  repoMain
}: IUpdateChangelog): Promise<void> {
  try {
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
    core.debug(`Repository name: ${repoMain}`)
    core.debug(`Owner: ${context.repo.owner} Repo: ${context.repo.repo}`)

    await toolkit.rest.git.updateRef({
      ...context.repo,
      sha: newCommitSHA,
      ref: repoMain,
      force: true
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}
