import * as core from '@actions/core'

import {ICreateNewRelease} from '../interfaces'
import countLogsLastInRelease from '../libs/quantity-logs'
import getOldlogs from '../libs/get-old-logs'

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
  commentFind,
  encoding
}: ICreateNewRelease): Promise<void> {
  try {
    core.debug(`Get version in ${changelogFileName}`)

    const oldLogs = await getOldlogs({changelogFileName, encoding})
    const logsSplit = oldLogs.split('\n')

    core.debug(`Logs in last release ${logsSplit[0]}`)

    const quantityLogs = countLogsLastInRelease(oldLogs, commentFind)

    core.debug(`Quantity logs in last release ${quantityLogs}`)

    if (quantityLogs >= 4) {
      const toolkit = getOctokit(githubToken())
      const ref = `refs/heads/release/v${logsSplit[0].split('v')[1]}`

      core.debug(`Current release ${logsSplit[0].split('v')[1]}`)

      await toolkit.rest.git.createRef({
        ref,
        sha: sha || context.sha,
        ...context.repo
      })
    }
    core.debug(`Current release ${logsSplit[0]}`)
  } catch (e: any) {
    throw new Error(e.message)
  }
}
