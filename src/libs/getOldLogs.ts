import fs from 'fs'

const fsPromises = fs.promises

import { IGetOldLogs } from '../interfaces'

export default async function getOldlogs({
  changelogFileName,
  encoding
}: IGetOldLogs): Promise<string> {
  try {
    const buf = await fsPromises.readFile(changelogFileName, encoding)
    const oldLogs = buf.toString(encoding)
    return oldLogs
  } catch (error) {
    throw new Error('Changelog not found')
  }
}