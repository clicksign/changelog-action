import {Context} from '@actions/github/lib/context'

export default interface IUpdateChangelog {
  toolkit: any
  context: Context
  file: any
  repoMain: string
}
