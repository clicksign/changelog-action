import {IMountSha} from '../interfaces'

async function mountSha({
  toolkit,
  context,
  repoMain,
  file
}: IMountSha): Promise<string> {
  const {
    data: {
      object: {sha: refSha}
    }
  } = await toolkit.rest.git.getRef({
    ...context.repo,
    ref: repoMain
  })

  const {
    data: {sha: newTreeSha}
  } = await toolkit.rest.git.createTree({
    ...context.repo,
    tree: file,
    base_tree: refSha
  })

  const {
    data: {sha: newCommitSHA}
  } = await toolkit.rest.git.createCommit({
    ...context.repo,
    tree: newTreeSha,
    parents: [refSha],
    message: 'action: atualizando changelog'
  })
  return newCommitSHA
}

export default mountSha
