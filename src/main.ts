import * as core from '@actions/core'
import changelog from './changelog'

async function run(): Promise<void> {
  try {
    const changelogFileName = core.getInput('changelog_file_name')
    const encoding = core.getInput('encoding')
    const logFind = core.getInput('log_find')
    const newLog = core.getInput('changelog_new_log')
    const payloadInjection = core.getInput('payload')
    const repoMain = core.getInput('repo_main').includes('release')
      ? `refs/${core.getInput('repo_main')}`
      : core.getInput('repo_main')
    const maxLogs = core.getInput('max_logs')

    core.debug(`Start update changelog ${new Date().toTimeString()}`)

    await changelog({
      changelogFileName,
      newLog,
      logFind,
      encoding,
      repoMain,
      payloadInjection,
      maxLogs: parseInt(maxLogs)
    })

    core.debug(`Finished update changelog${new Date().toTimeString()}`)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
