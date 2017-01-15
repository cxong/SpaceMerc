import Phaser from 'phaser'
import { SCREEN_WIDTH, SCREEN_HEIGHT, WORLD_WIDTH } from './graphics'
import Camera from './camera'
import Character from './character'
import GroundGen from './ground'
import LocationSpawner from './location_spawner'
import MapGen from './mapgen'
import Music from './music'
import Player from './player'
import ScreenSpawner from './screen_spawner'
import Wave from './wave'

export default class extends Phaser.State {
  preload() {
    this.resetKeys();
  }

  create() {
    this.game.stage.backgroundColor = 0x4f3458;

    this.game.world.width = WORLD_WIDTH
    this.game.physics.setBoundsToWorld()
    this.camera = new Camera(this.game.camera)

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.sounds = {
      catch: this.game.add.audio('catch'),
      die: this.game.add.audio('die'),
      hit: this.game.add.audio('hit'),
      nospawn: this.game.add.audio('nospawn'),
      respawn: this.game.add.audio('respawn'),
      spawn: this.game.add.audio('spawn')
    }
    this.music = new Music(this.game)

    this.groups = {
      ground: this.game.add.group(),
      bg: this.game.add.group(),
      platforms: this.game.add.group(),
      enemies: this.game.add.group(),
      players: this.game.add.group(),
      enemyBullets: this.game.add.group(),
      playerBullets: this.game.add.group(),
      fx: this.game.add.group(),
      ui: this.game.add.group()
    }

    this.text = this.game.add.text(
      SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, '', {
        font: '36px VT323', fill: '#fff', align: 'center'
      }
    );
    this.text.anchor.setTo(0.5)
    this.groups.ui.add(this.text);

    // States: title, play, over
    this.restart();
  }

  restart() {
    this.state = 'title';
    //this.groups.dialogs.alpha = 1;
    this.game.input.keyboard.addKey(Phaser.Keyboard.X).onDown.add(function() {
      this.start();
    }, this);
    this.music.play('title')
  }

  start() {
    // Hide dialog
    //this.groups.dialogs.alpha = 0;

    // Spawn player and enemies

    this.groups.bg.destroy(true, true);

    this.groups.players.destroy(true, true);
    this.spawnPlayer();

    this.groups.enemies.destroy(true, true);
    this.wave = new Wave(this.game, this.groups)
    // Enemies will be spawned automatically by wave
    this.locationSpawner = new LocationSpawner(this.game, this.groups)
    this.screenSpawner = new ScreenSpawner(this.game, this.groups)
    this.mapgen = new MapGen(this.game, this.groups.platforms)
    this.groundGen = new GroundGen(this.game, this.groups.ground)

    // Initialise controls
    this.resetKeys();
    this.keys = this.game.input.keyboard.addKeys({
      up: Phaser.Keyboard.UP,
      down: Phaser.Keyboard.DOWN,
      left: Phaser.Keyboard.LEFT,
      right: Phaser.Keyboard.RIGHT,
      fire: Phaser.Keyboard.X,
      jump: Phaser.Keyboard.Z
    });

    this.state = 'play';
    this.music.play('l1')
  }

  spawnPlayer() {
    this.player = new Player(
      this.game, this.groups, SCREEN_WIDTH / 2, SCREEN_HEIGHT - 50, [])
    this.sounds.respawn.play()
  }

  gameEnd() {
    this.state = 'over';
    this.resetKeys();
    this.game.input.keyboard.addKey(Phaser.Keyboard.X).onDown.add(function() {
      this.restart();
    }, this);
    this.setText('Game Over');
    // TODO: sad game over music
  }

  update() {
    if (this.state === 'play') {
      this.textCounter -= this.game.time.elapsed;
      if (this.textCounter <= 0) {
        this.text.alpha = 0;
      }

      this.camera.followPlayers(this.groups.players)
      this.game.world.setBounds(
        this.game.camera.x, 0, WORLD_WIDTH - this.game.camera.x, SCREEN_HEIGHT)
      this.locationSpawner.update(this.game.camera.x)
      this.screenSpawner.update(this.game.camera.x)
      this.mapgen.update(this.game.camera.x)
      this.groundGen.update(this.game.camera.x)

      // Destroy stuff that's too far to the left
      const destroyToTheLeft = (group) => {
        group.forEach((sprite) => {
          if (sprite.x + sprite.width < this.game.camera.x - SCREEN_WIDTH) {
            sprite.destroy()
          }
        })
      }
      destroyToTheLeft(this.groups.enemies)
      destroyToTheLeft(this.groups.platforms)
      destroyToTheLeft(this.groups.ground)

      // Destroy bullets that are off-camera
      const destroyBulletsOffCamera = (group) => {
        group.forEach((bullet) => {
          if (!this.game.camera.view.intersects(bullet.body)) {
            bullet.destroy()
          }
        })
      }
      destroyBulletsOffCamera(this.groups.enemyBullets)
      destroyBulletsOffCamera(this.groups.playerBullets)

      // Move using arrow keys
      let dx = 0
      if (this.keys.left.isDown) {
        dx = -1
      } else if (this.keys.right.isDown) {
        dx = 1
      }
      let dy = 0
      if (this.keys.up.isDown) {
        dy = -1
      } else if (this.keys.down.isDown) {
        dy = 1
      }
      this.player.move(dx, dy);

      // firing
      if (this.keys.fire.isDown) {
        this.player.fire();
      }

      // Jumping
      if (this.keys.jump.isDown) {
        this.player.jump();
      }

      // End game
      if (!this.player.alive) {
        this.gameEnd();
      }
    }

    // Depth sort
    this.groups.enemies.sort(
      'y', Phaser.Group.SORT_ASCENDING);
    this.groups.players.sort(
      'y', Phaser.Group.SORT_ASCENDING);

    // Platforming
    this.updatePlatforming(this.groups.players)
    this.updatePlatforming(this.groups.enemies)

    // Player bullets to enemy
    this.game.physics.arcade.overlap(
      this.groups.playerBullets, this.groups.enemies,
      function(bullet, enemy) {
        // TODO: enemy kill effects
        bullet.kill();
        enemy.kill();
        this.sounds.hit.play();
      }, null, this
    );

    // Enemy bullets to players
    this.game.physics.arcade.overlap(
      this.groups.enemyBullets, this.groups.players,
      function(bullet, player) {
        if (player.invincibilityCounter > 0) {
          // Can't kill when invincible
          return;
        }
        player.damage(10);
        this.sounds.hit.play();
      }, null, this
    );

    // Enemy spawning
    // Note: spawn next wave if less than half wave
    // remaining
    /*if (this.wave &&
      this.groups.enemies.countLiving() < this.wave.waveTotal() / 2) {
      this.wave.wave++;
      this.wave.spawn();
      this.setText('Wave ' + this.wave.wave);
      // TODO: some sort of incidental music
    }*/
  }

  updatePlatforming(group) {
    group.forEach((c) => {
      if (!(c instanceof Character)) {
        return
      }
      c.isOnPlatform = false
    })
    this.game.physics.arcade.collide(
      group, this.groups.platforms, (c, platform) => {
        if (!(c instanceof Character)) {
          return
        }
        if (c.body.touching.down) {
          c.touchFloor()
        }
        c.isOnPlatform = c.body.touching.down
      }, (c, platform) => {
        if (!(c instanceof Character)) {
          return false
        }
        // Don't collide if jumping or just falling through platform
        return c.body.velocity.y > 0 && c.jumpDownCounter <= 0
      })
    this.game.physics.arcade.collide(
      group, this.groups.ground, (c, ground) => {
        if (!(c instanceof Character)) {
          return
        }
        if (c.body.touching.down) {
          c.touchFloor()
        }
      }, (c, ground) => {
        if (!(c instanceof Character)) {
          return false
        }
        // Don't collide if jumping
        return c.body.velocity.y > 0
      })
  }

  setText(text) {
    this.text.text = text;
    this.textCounter = 3000;
    this.text.alpha = 1;
  }

  resetKeys() {
    this.game.input.keyboard.reset(true);
    // Always allow F for fullscreen toggle
    this.game.input.keyboard.addKey(Phaser.Keyboard.F).onDown.add(function() {
      if (this.game.scale.isFullScreen) {
        this.game.scale.stopFullScreen();
      } else {
        this.game.scale.startFullScreen(false);
      }
    }, this);
  }

  render() {
    if (this.player) {
      //this.game.debug.body(this.player)
      //this.game.debug.cameraInfo(this.game.camera, 32, 32)
      //this.game.debug.spriteCoords(this.player, 32, 150)
    }
    //this.game.debug.text(this.groups.playerBullets.total, 100, 100)
  }
}
