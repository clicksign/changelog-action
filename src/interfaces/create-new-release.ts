import { Context } from '@actions/github/lib/context';

export default interface ICreateNewRelease {
  getOctokit: any
  context: Context
  branch: string
  sha?: string
  changelogFileName: string
  encoding: any
}
