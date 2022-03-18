import {Context} from '@actions/github/lib/context'

export default interface ICreateNewRelease {
  getOctokit: any
  context: Context
  sha?: string
  changelogFileName: string
  logFind: string
  encoding: any
}
