export default class Reference {
  referenceName: string
  referenceId: number | null
  constructor(referenceName) {
    this.referenceName = referenceName
    this.referenceId = null
  }
}
