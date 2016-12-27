const VOLUME = 0.1

export default class {
  constructor(game) {
    this.game = game
    this.musics = {
      title: this.game.add.audio('title'),
      l1: this.game.add.audio('1')
    }
    this.music = null
  }

  play(name) {
    if (this.music) {
      this.game.add.tween(this.music).to({volume: 0}).start()
    }
    this.music = this.musics[name]
    if (!this.music.isPlaying) {
      this.music.play('', 0, 0, true)
    }
    this.game.add.tween(this.music).to({volume: VOLUME}).start()
  }
}
