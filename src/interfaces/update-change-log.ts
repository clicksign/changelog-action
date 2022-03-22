import {Context} from '@actions/github/lib/context'

export default interface IUpdateChangelog {
  toolkit: any
  context: Context
  sha?: string
  changelogFileName: string
  newLog: string
  newComments?: string
  logFind: string
  commentFind: string
  encoding: any
  oldLogs: string
  quantityLogs: number
}
