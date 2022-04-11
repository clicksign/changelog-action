import {Context} from '@actions/github/lib/context'

export default interface IMountSha {
  toolkit: any
  context: Context
  repoMain: string
  file: any
}
