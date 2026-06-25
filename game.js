import Boot from './scenes/Boot.js';
import Game from './scenes/Game.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#090c17",

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },

    scene: [
        Boot,
        Game
    ]
};

new Phaser.Game(config);