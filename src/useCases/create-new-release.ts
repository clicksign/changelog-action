import {ICreateNewRelease} from '../interfaces'

function githubToken(): string {
  const token = process.env.GITHUB_TOKEN
  if (!token)
    throw ReferenceError('No token defined in the environment variables')
  return token
}

export default async function createNewRelease({
  getOctokit,
  context,
  sha,
  logsSplit
}: ICreateNewRelease): Promise<void> {
  try {
    const toolkit = getOctokit(githubToken())
    const ref = `refs/heads/release/v${logsSplit[0].split('v')[1]}`

    await toolkit.rest.git.createRef({
      ref,
      sha: sha || context.sha,
      ...context.repo
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}
