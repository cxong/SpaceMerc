export default class {
  constructor(duration) {
    this.count = 0
    this.duration = duration
  }

  update(ms) {
    if (this.count > 0) {
      this.count -= ms
    }
  }

  reset(duration) {
    if (duration) {
      this.duration = duration
    }
    this.count = this.duration
  }
}
