export default function newVersion(oldVersion: string): string {
  const releaseVersion = oldVersion.split("v")[1].split(".")
  releaseVersion[1] = (parseInt(releaseVersion[1]) + 1).toString()
  return releaseVersion.join(".")
}