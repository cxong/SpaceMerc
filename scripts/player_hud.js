import Phaser from 'phaser'
import { MAX_HEALTH } from './graphics'

export default class extends Phaser.Group {
  constructor(game, parent, player, x, y) {
    super(game, parent)
    this.fixedToCamera = true
    this.cameraOffset.setTo(x, y)
    this.player = player
    this.text = game.add.text(
      0, 0, 'P1', {
        font: '12px VT323', fill: '#fff', align: 'center'
      }
    )
    this.add(this.text)
    this.back = this.create(0, 16, 'player_hud_back')
    this.health = this.create(8, 16, 'player_hud_health')
    this.healthWidth = this.health.width
  }

  update() {
    // Update health bar
    const cropRect = new Phaser.Rectangle(
      0, 0,
      this.healthWidth * this.player.health / MAX_HEALTH, this.health.height)
    this.health.crop(cropRect)
  }
}
