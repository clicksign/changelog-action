import axios from 'axios'
import * as core from '@actions/core'

import mountPayload from '../libs/mount-payload'

export default async function slackSend(
  payloadInject: string,
  release: string,
  repoName: string
): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL
    const time = new Date().toTimeString()
    let payload = ''

    if (payloadInject) {
      payload = payloadInject
    } else {
      const newRelease = release.split('.')
      newRelease[1] = (parseInt(newRelease[1]) - 1).toString()
      payload = mountPayload({
        repoName,
        newRelease: `release/v${newRelease.join('.')}`,
        mainRelease: `release/v${release}`,
        time
      })
    }

    if (webhookUrl === undefined) {
      core.debug('Need to provide at least one webhookUrl')
    }

    if (typeof webhookUrl !== 'undefined' && webhookUrl.length > 0) {
      try {
        await axios.post(webhookUrl, payload)
      } catch (error: any) {
        throw new Error(error.message)
      }
    }

    core.debug(time)
  } catch (error: any) {
    throw new Error(error.message)
  }
}
