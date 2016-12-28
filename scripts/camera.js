import Phaser from 'phaser'
import { WORLD_WIDTH } from './graphics'

export default class {
  constructor(camera) {
    this.camera = camera
    this.camera.bounds.width = WORLD_WIDTH
  }

  followPlayers(players) {
    let positionSum = new Phaser.Point(0, 0)
    let playerCount = 0
    players.forEach((player) => {
      positionSum.add(player.x, player.y)
      playerCount++
    })
    if (playerCount > 0) {
      const x = Math.round(positionSum.x / playerCount)
      // Only move camera to the right
      if (x > this.camera.position.x + this.camera.width / 2) {
        this.camera.focusOnXY(x, 0)
      }
    }
  }
}
