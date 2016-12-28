import Phaser from 'phaser'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './graphics'

const HEIGHT = 35

export default class {
  constructor(game, group) {
    this.game = game
    this.group = group
    this.nextSpawnX = 0
  }

  update(cameraX) {
    if (this.nextSpawnX < cameraX + SCREEN_WIDTH) {
      const ground = this.game.add.tileSprite(
        this.nextSpawnX, SCREEN_HEIGHT - HEIGHT, SCREEN_WIDTH, HEIGHT, 'ground')
      this.game.physics.enable(ground, Phaser.Physics.ARCADE)
      ground.body.immovable = true
      ground.body.setSize(ground.width, 16, 0, HEIGHT - 16)
      ground.outOfBoundsKill = true
      this.group.add(ground)
      this.nextSpawnX += SCREEN_WIDTH
    }
  }
}
