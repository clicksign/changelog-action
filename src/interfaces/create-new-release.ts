import {Context} from '@actions/github/lib/context'

export default interface ICreateNewRelease {
  toolkit: any
  context: Context
  logsSplit: string[]
}
