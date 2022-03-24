import {Context} from '@actions/github/lib/context'

export default interface IUpdateChangelog {
  toolkit: any
  context: Context
  changelogFileName: string
  newLog: string
  logFind: string
  oldLogs: string
  quantityLogs: number
  repoMain: string
}
