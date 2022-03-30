import {IMountPayload} from '../interfaces/index'

export default function mountPayload({
  newRelease,
  mainRelease,
  time
}: IMountPayload): string {
  return `{
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
          "text": ":new: Aberta a branch \`${newRelease}\` \\n\\n :rocket: Atualizada a main para ser candidata à \`${mainRelease}\`"
        }
      },
      {
        "type": "context",
        "elements" : [
          {
            "type": "mrkdwn",
            "text": "Release ${newRelease} criada em ${time}"
          }
        ]
      },
      {
        "type": "divider"
      }
    ]
  }`
}
