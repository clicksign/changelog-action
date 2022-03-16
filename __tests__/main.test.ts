import path from 'path'

import {expect} from '@jest/globals'

import getOldlogs from "../src/libs/getOldLogs"
import mountChangelogWithNewPR, { newVersion } from "../src/libs/mountChangelogWithNewPR"
import countLogsLastInRelease from "../src/libs/quantityLogs"

const getOldLogs = async (filePath: string) => {
  const changelogFileName = path.resolve(filePath)
  const encoding = 'utf-8'
  const oldLogs = await getOldlogs({changelogFileName, encoding})
  return oldLogs
}

describe('Cangelog Action', () => {
  it('should read file not found', async () => {
    await expect(getOldLogs('__tests__/test666.md')).rejects.toThrow(
      'Changelog not found'
    )
  })

  it('should read file', async () => {
    const oldLogs = await getOldLogs('__tests__/test.md')

    expect('file read test').toBe(oldLogs)
  })

  it('should mount final log with one line', async () => {
    const newLog = 'add log'
    const oldLogs = await getOldLogs('__tests__/test.md')
    const wordFind = 'file read test'

    const finalLog = mountChangelogWithNewPR({newLog, oldLogs, wordFind})
    expect(`${oldLogs}\n- ${newLog}`).toBe(finalLog)
  })

  it('should mount final log with multi line', async () => {
    const newLog = 'add log'
    const oldLogs = await getOldLogs('__tests__/test2.md')
    const wordFind = '## Alterações'

    const log = `# v1.0.0

${wordFind}\n- ${newLog}
---
`

    const finalLog = mountChangelogWithNewPR({newLog, oldLogs, wordFind})
    expect(log).toBe(finalLog)
  })

  it('should mount final log with four line', async () => {
    const newLog = '[KZ1] Line 4'
    const oldLogs = await getOldLogs('__tests__/test3.md')
    const wordFind = '## Alterações'

    const log = `# v1.0.0

${wordFind}\n- ${newLog}
- [KZ1] Line 3
- [KZ1] Line 2
- [KZ1] Line 1
---
`

    const finalLog = mountChangelogWithNewPR({newLog, oldLogs, wordFind})
    expect(log).toBe(finalLog)
  })

  it('should mount final log with four line', async () => {
    const newLog = '[KZ123] Line 5'
    const oldLogs = await getOldLogs('__tests__/test4.md')
    const wordFind = '## Alterações'

    const log = `# v1.2.0

## Alterações
---

# v1.1.0

## Alterações
- ${newLog}
- [KZ123] Line 4
- [KZ123] Line 3
- [KZ123] Line 2
- [KZ123] Line 1
---

# v1.0.0

## Alterações
- [KZ1] Line 5
- [KZ1] Line 4
- [KZ1] Line 3
- [KZ1] Line 2
- [KZ1] Line 1
---
`

    const finalLog = mountChangelogWithNewPR({newLog, oldLogs, wordFind})
    expect(log).toBe(finalLog)
  })

  it('should create new version release in changelog', async () => {
    const newVersionRelease = newVersion("v1.0.0")
    expect(newVersionRelease).toBe("1.1.0")
  })

  it('should quantity logs in last release', async () => {
    const wordFind = '## Alterações'

    const oldLogs2 = await getOldLogs('__tests__/test2.md')
    const oldLogs3 = await getOldLogs('__tests__/test3.md')
    const oldLogs4 = await getOldLogs('__tests__/test4.md')
    
    const quantityLogs2 = countLogsLastInRelease(oldLogs2, wordFind)
    const quantityLogs3 = countLogsLastInRelease(oldLogs3, wordFind)
    const quantityLogs4 = countLogsLastInRelease(oldLogs4, wordFind)

    expect(quantityLogs2).toBe(0)
    expect(quantityLogs3).toBe(3)
    expect(quantityLogs4).toBe(4)
  })
})
