import * as core from '@actions/core'
import changelog from './changelog'

async function run(): Promise<void> {
  try {
    const changelogFileName = core.getInput('changelog_file_name')
    const newLog = core.getInput('changelog_new_log')
    const logFind = core.getInput('log_find')
    const encoding = core.getInput('encoding')
    const repoMain = core.getInput('repo_main')

    core.debug(`Start update changelog ${new Date().toTimeString()}`)

    await changelog({
      changelogFileName,
      newLog,
      logFind,
      encoding,
      repoMain
    })

    core.debug(`Finished update changelog${new Date().toTimeString()}`)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
