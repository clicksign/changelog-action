import {getOctokit, context} from '@actions/github'
import * as core from '@actions/core'

import {IChangeLog} from './interfaces'
import updateChangelog from './useCases/update-changelog'
import createNewRelease from './useCases/create-new-release'

export default async function changelog({
  changelogFileName,
  newLog,
  newComments,
  logFind,
  commentFind,
  encoding
}: IChangeLog): Promise<void> {
  try {
    const sha = core.getInput('sha')

    await createNewRelease({
      getOctokit,
      context,
      sha,
      changelogFileName,
      commentFind,
      encoding
    })

    updateChangelog({
      changelogFileName,
      newLog,
      newComments,
      logFind,
      commentFind,
      encoding
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}
