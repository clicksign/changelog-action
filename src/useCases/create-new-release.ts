import {ICreateNewRelease} from '../interfaces'

export default async function createNewRelease({
  toolkit,
  context,
  logsSplit
}: ICreateNewRelease): Promise<void> {
  try {
    const ref = `refs/heads/release/v${logsSplit[0].split('v')[1]}`
    await toolkit.rest.git.createRef({
      ref,
      sha: context.sha,
      ...context.repo
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}
