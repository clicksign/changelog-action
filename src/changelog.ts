import { IChangeLog } from './interfaces'
import updateChangelog from "./useCases/updateChangelog"

export default async function changelog({
  changelogFileName,
  newLog,
  newComments,
  logFind,
  commentFind,
  encoding
}: IChangeLog): Promise<void> {
  try {
    updateChangelog({
      changelogFileName,
      newLog,
      newComments,
      logFind,
      commentFind,
      encoding
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}
