import { getOctokit, context } from '@actions/github';
import * as core from '@actions/core';

import { IChangeLog } from './interfaces'
import updateChangelog from "./useCases/updateChangelog"
import createNewRelease from "./useCases/createNewRelease"

export default async function changelog({
  changelogFileName,
  newLog,
  newComments,
  logFind,
  commentFind,
  encoding
}: IChangeLog): Promise<void> {
  try {
    updateChangelog({
      changelogFileName,
      newLog,
      newComments,
      logFind,
      commentFind,
      encoding
    })

    const branch = core.getInput('branch');
    const sha = core.getInput('sha');

    await createNewRelease({
      getOctokit,
      context,
      branch,
      sha,
      changelogFileName,
      encoding
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}
