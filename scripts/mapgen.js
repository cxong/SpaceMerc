import Phaser from 'phaser'
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './graphics'

// Create platforms randomly across map
export default class {
  constructor(game, group) {
    this.game = game
    this.group = group
    this.nextSpawnX = 0
  }

  update(cameraX) {
    if (this.nextSpawnX < cameraX + SCREEN_WIDTH / 2) {
      // Randomly place platforms
      for (let x = this.nextSpawnX; x < this.nextSpawnX + SCREEN_WIDTH; x += 16) {
        for (let y = 0; y < SCREEN_HEIGHT; y += 16) {
          if (this.game.rnd.integerInRange(0, 10) < 1) {
            const block = this.group.create(x, y, 'block')
            this.game.physics.enable(block, Phaser.Physics.ARCADE)
            block.body.immovable = true
            block.body.checkCollision.down = false
            block.body.checkCollision.left = false
            block.body.checkCollision.right = false
          }
        }
      }
      this.nextSpawnX += SCREEN_WIDTH
    }
  }
}
