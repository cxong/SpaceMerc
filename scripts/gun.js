import Bullet from './bullet'

export default class Gun {
  constructor(game, bulletGroup, sprite, sound, stats) {
    this.game = game
    this.bulletGroup = bulletGroup
    this.sprite = sprite
    this.sound = game.add.audio(sound)
    this.fireCounter = 0
    this.stats = stats
  }

  canFire() {
      return this.fireCounter <= 0
  }

  fire(muzzlePos, v) {
    this.bulletGroup.add(
      new Bullet(this.game, muzzlePos.x, muzzlePos.y, this.sprite, v))
    this.sound.play()
    this.fireCounter = this.stats.fireDuration
  }

  update() {
    if (this.fireCounter > 0) {
      this.fireCounter -= this.game.time.physicsElapsedMS
    }
  }
}
