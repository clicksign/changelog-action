import { IChangeLog } from './interfaces'
import addNewLog from "./useCases/addNewLog"

export default async function changelog({
  changelogFileName,
  newLog,
  newComments,
  logFind,
  commentFind,
  encoding
}: IChangeLog): Promise<void> {
  try {
    addNewLog({
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
