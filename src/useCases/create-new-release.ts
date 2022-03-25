import {ICreateNewRelease} from '../interfaces'

export default async function createNewRelease({
  toolkit,
  context,
  file,
  logsSplit
}: ICreateNewRelease): Promise<void> {
  try {
    const commits = await toolkit.rest.repos.listCommits({
      ...context.repo
    })

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

    const ref = `refs/heads/release/v${logsSplit[0].split('v')[1]}`

    await toolkit.rest.git.createRef({
      ref,
      sha: newCommitSHA || context.sha,
      ...context.repo
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}
