import * as core from '@actions/core'

import {ICreateNewRelease} from '../interfaces'
import getOldlogs from '../libs/get-old-logs'
import newVersion from '../libs/version'

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
  changelogFileName,
  encoding
}: ICreateNewRelease): Promise<void> {
  try {
    core.debug(`Get version in ${changelogFileName}`)

    const oldLogs = await getOldlogs({changelogFileName, encoding})
    const logsSplit = oldLogs.split('\n')
    const releaseNewVersion = newVersion(logsSplit[0])

    const toolkit = getOctokit(githubToken())
    const ref = `refs/heads/release/v${releaseNewVersion}`

    await toolkit.rest.git.createRef({
      ref,
      sha: sha || context.sha,
      ...context.repo
    })

    core.debug(`New release ${releaseNewVersion}`)
  } catch (e: any) {
    throw new Error(e.message)
  }
}
