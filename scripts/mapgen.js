import Phaser from 'phaser'
import { SCREEN_WIDTH, SCREEN_HEIGHT, TILE_SIZE } from './graphics'

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
      // Leave top two rows empty
      for (let y = TILE_SIZE * 2;
          // Leave bottom row empty
          y < SCREEN_HEIGHT - TILE_SIZE;
          y += TILE_SIZE) {
        for (let x = this.nextSpawnX;
            x < this.nextSpawnX + SCREEN_WIDTH;
            x += TILE_SIZE) {
          // Check if current location and location to the left are empty
          let locationsEmpty = true
          this.game.physics.arcade.getObjectsAtLocation(
            x, y, this.group, () => { locationsEmpty = false })
          this.game.physics.arcade.getObjectsAtLocation(
            x - TILE_SIZE, y, this.group, () => { locationsEmpty = false })
          const roll = this.game.rnd.integerInRange(0, 30)
          const place = roll < 2
          if (place && locationsEmpty) {
            const width = this.game.rnd.integerInRange(1, 15)
            const style = this.game.rnd.integerInRange(0, 8)
            for (let i = 0; i < width; i++, x += 16) {
              const block = this.group.create(x, y, 'block')
              block.frame = style * 4
              if (i === 0) {
                if (width > 1) {
                  block.frame += 1
                }
              } else if (i === width - 1) {
                block.frame += 3
              } else {
                block.frame += 2
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
