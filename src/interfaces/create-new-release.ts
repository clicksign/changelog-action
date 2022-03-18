import {Context} from '@actions/github/lib/context'

export default interface ICreateNewRelease {
  getOctokit: any
  context: Context
  sha?: string
  logsSplit: string[]
}
