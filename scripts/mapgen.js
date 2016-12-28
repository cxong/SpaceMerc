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
    if (this.nextSpawnX < cameraX + SCREEN_WIDTH) {
      // Randomly place platforms
      for (let y = 0; y < SCREEN_HEIGHT - 16; y += 16) {
        for (let x = this.nextSpawnX; x < this.nextSpawnX + SCREEN_WIDTH; x += 16) {
          const roll = this.game.rnd.integerInRange(0, 30)
          const place = roll < 2
          if (place) {
            const width = this.game.rnd.integerInRange(2, 15)
            for (let i = 0; i < width; i++, x += 16) {
              const block = this.group.create(x, y, 'block')
              if (i === 0) {
                block.frame = 0
              } else if (i === width - 1) {
                block.frame = 2
              } else {
                block.frame = 1
              }
              this.game.physics.enable(block, Phaser.Physics.ARCADE)
              block.body.immovable = true
              block.body.checkCollision.down = false
              block.body.checkCollision.left = false
              block.body.checkCollision.right = false
            }
          }
        }
      }
      this.nextSpawnX += SCREEN_WIDTH
    }
  }
}
