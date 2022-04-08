import path from 'path'

import {expect} from '@jest/globals'

import getOldlogs from '../src/libs/get-old-logs'
import countLogsLastInRelease from '../src/libs/quantity-logs'
import newVersion from '../src/libs/version'
import mountChangelogWithNewPR from '../src/libs/mount-changelog-with-new-pr'
import mountPayload from '../src/libs/mount-payload'

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
    const logFind = 'file read test'
    const quantityLogs = countLogsLastInRelease(oldLogs, logFind)
    const maxLogs = 4

    const finalLog = mountChangelogWithNewPR({
      newLog,
      oldLogs,
      logFind,
      quantityLogs,
      maxLogs
    })
    expect(`${oldLogs}\n- ${newLog}`).toBe(finalLog)
  })

  it('should get current version', async () => {
    const oldLogs = await getOldLogs('__tests__/test5.md')
    const logsSplit = oldLogs.split('\n')
    const currentVersion = logsSplit[0].split('v')[1]

    expect(currentVersion).toBe('1.2.0')
  })

  it('should mount final log with multi line', async () => {
    const newLog = 'add log'
    const oldLogs = await getOldLogs('__tests__/test2.md')
    const logFind = '## Alterações'
    const quantityLogs = countLogsLastInRelease(oldLogs, logFind)
    const maxLogs = 4

    const log = `# v1.0.0

${logFind}\n- ${newLog}
---
`

    const finalLog = mountChangelogWithNewPR({
      newLog,
      oldLogs,
      logFind,
      quantityLogs,
      maxLogs
    })
    expect(log).toBe(finalLog)
  })

  it('should mount final log with four line', async () => {
    const newLog = '[KZ1] Line 4'
    const oldLogs = await getOldLogs('__tests__/test3.md')
    const logFind = '## Alterações'
    const quantityLogs = countLogsLastInRelease(oldLogs, logFind)
    const maxLogs = 4

    const log = `# v1.0.0

${logFind}\n- ${newLog}
- [KZ1] Line 3
- [KZ1] Line 2
- [KZ1] Line 1
---
`

    const finalLog = mountChangelogWithNewPR({
      newLog,
      oldLogs,
      logFind,
      quantityLogs,
      maxLogs
    })
    expect(log).toBe(finalLog)
  })

  it('should mount final log with four line', async () => {
    const newLog = '[KZ123] Line 5'
    const oldLogs = await getOldLogs('__tests__/test4.md')
    const logFind = '## Alterações'
    const quantityLogs = countLogsLastInRelease(oldLogs, logFind)
    const maxLogs = 4

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

    const finalLog = mountChangelogWithNewPR({
      newLog,
      oldLogs,
      logFind,
      quantityLogs,
      maxLogs
    })
    expect(log).toBe(finalLog)
  })

  it('should create new version release in changelog', async () => {
    const newVersionRelease = newVersion('v1.0.0')
    expect(newVersionRelease).toBe('1.1.0')
  })

  it('should quantity logs in last release', async () => {
    const wordFind = '## Alterações'

    const oldLogs2 = await getOldLogs('__tests__/test2.md')
    const oldLogs3 = await getOldLogs('__tests__/test3.md')
    const oldLogs4 = await getOldLogs('__tests__/test4.md')
    const oldLogs5 = await getOldLogs('__tests__/test5.md')

    const quantityLogs2 = countLogsLastInRelease(oldLogs2, wordFind)
    const quantityLogs3 = countLogsLastInRelease(oldLogs3, wordFind)
    const quantityLogs4 = countLogsLastInRelease(oldLogs4, wordFind)
    const quantityLogs5 = countLogsLastInRelease(oldLogs5, wordFind)

    expect(quantityLogs2).toBe(0)
    expect(quantityLogs3).toBe(3)
    expect(quantityLogs4).toBe(4)
    expect(quantityLogs5).toBe(0)
  })

  it('should mount payload', async () => {
    const time = new Date().toTimeString()
    const payload = mountPayload({
      newRelease: 'release/v1.0.0',
      mainRelease: 'release/v1.1.0',
      time
    })

    const payloadFake = `{
      "text": "NOVA RELEASE :new::new::new:.",
      "blocks": [
        {
          "type": "context",
          "elements" : [
            {
              "type": "mrkdwn",
              "text": "*NOVA RELEASE*"
            },
            {
              "type": "mrkdwn",
              "text": "@channel"
            }
          ]
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "block_id": "section567",
          "text": {
            "type": "mrkdwn",
            "text": ":new: Aberta a branch \`release/v1.0.0\` \\n\\n :rocket: Atualizada a main para ser candidata à \`release/v1.1.0\`"
          }
        },
        {
          "type": "context",
          "elements" : [
            {
              "type": "mrkdwn",
              "text": "Release release/v1.0.0 criada em ${time}"
            }
          ]
        },
        {
          "type": "divider"
        }
      ]
    }`

    expect(
      payload
        .replace(/(\r\n|\n|\r)/gm, '')
        .split(' ')
        .join('')
    ).toBe(
      payloadFake
        .replace(/(\r\n|\n|\r)/gm, '')
        .split(' ')
        .join('')
    )
  })
})
