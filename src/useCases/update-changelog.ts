import {IUpdateChangelog} from '../interfaces'

export default async function updateChangelog({
  toolkit,
  context,
  newCommitSHA,
  repoMain
}: IUpdateChangelog): Promise<void> {
  try {
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
