const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#ffffff",

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },

    scene: {
        preload,
        create,
        update
    }
};

new Phaser.Game(config);

let player;
let cursors;
let ground;
let platforms;
let stars;
let bombs;

let score = 0;
let scoreText;
let gameOver = false;
let lastScaleMilestone = 0;

const colors = [
    0xff0000,
    0xff7f00,
    0xffff00,
    0x00ff00,
    0x0000ff,
    0x4b0082,
    0x9400d3
];

let colorIndex = 0;

function preload() {
    this.load.image("bg", "assets/bg.png");
    this.load.image("mainGround", "assets/tiles/ground.png");
    this.load.image("platform", "assets/tiles/platform.png");
    this.load.spritesheet("player", "assets/player.png", {
        frameWidth: 540,
        frameHeight: 540
    });
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
}

function create() {
    this.add.image(400, 300, "bg").setDisplaySize(800, 600);

    ground = this.physics.add.staticGroup();

    const base = ground.create(400, 580, "mainGround");

    base.setScale(800 / base.width, 100 / base.height);
    base.refreshBody();

    base.body.setSize(base.displayWidth, 30);
    base.body.setOffset(0, base.displayHeight - 80);

    platforms = this.physics.add.staticGroup();

    const platformPositions = [
        { x: 150, y: 450 },
        { x: 440, y: 360 },
        { x: 400, y: 280 },
        { x: 750, y: 410 },
        { x: 90, y: 250 },
        { x: 650, y: 150 },
        { x: 350, y: 100 },
        
    ];

    platformPositions.forEach(pos => {
        const p = platforms.create(pos.x, pos.y, "platform");
        p.setScale(0.5);
        p.refreshBody();
        p.body.setSize(p.displayWidth, 20);
        p.body.setOffset(0, p.displayHeight - 20);
    });

    player = this.physics.add.sprite(100, 400, "player");

    player.setScale(0.1);
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    player.setSize(180, 425);
    player.setOffset(180, 180);

    this.physics.add.collider(player, ground);
    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    this.anims.create({
        key: "idle",
        frames: [{ key: "player", frame: 0 }],
        frameRate: 1,
        repeat: -1
    });

    this.anims.create({
        key: "walk",
        frames: [
            { key: "player", frame: 2 },
            { key: "player", frame: 3 }
        ],
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: "jump",
        frames: [{ key: "player", frame: 1 }],
        frameRate: 1
    });

    player.play("idle");

    stars = this.physics.add.group();

    spawnStar(this);

    this.physics.add.collider(stars, ground);
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, ground);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    scoreText = this.add.text(520, 20, "Stars Collected: 0", {
        fontSize: "28px",
        fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
        color: "#ffffff",
        fontStyle: "bold"
    });
}

function update() {
    if (gameOver) return;

    let speed = 250;
    let moving = false;

    if (cursors.shift.isDown) speed = 280;

    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        player.setFlipX(true);
        moving = true;
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(speed);
        player.setFlipX(false);
        moving = true;
    }
    else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown && player.body.blocked.down) {
        player.setVelocityY(-520);
    }

    if (!player.body.blocked.down) {
        player.play("jump", true);
    }
    else if (moving) {
        player.play(speed > 250 ? "run" : "walk", true);
    }
    else {
        player.play("idle", true);
    }
}

function spawnStar(scene) {
    const x = Phaser.Math.Between(50, 750);
    const star = stars.create(x, 0, "star");
    star.setScale(0.5);
    star.setCircle(star.width / 2);
    star.setBounce(0);
    star.setCollideWorldBounds(true);
}

function collectStar(player, star) {
    star.destroy();

    score++;
    scoreText.setText("Stars Collected: " + score);

    player.setTint(colors[colorIndex]);

    colorIndex = (colorIndex + 1) % colors.length;

    if (Math.floor(score / 5) > lastScaleMilestone) {
        lastScaleMilestone++;
        player.setScale(player.scaleX * 1.1);
    }

    spawnStar(this);

    const x = player.x < 400 ? Phaser.Math.Between(420, 780) : Phaser.Math.Between(20, 380);
    const bomb = bombs.create(x, 0, "bomb");

    bomb.body.setOffset(0, 70);

    bomb.setScale(0.5);
    bomb.setCircle(bomb.displayWidth / 2);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);

    bomb.setVelocity(Phaser.Math.Between(-220, 220), 20);
}

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);
    player.anims.stop();

    gameOver = true;

    this.add.text(260, 200, "GAME OVER", {
        fontSize: "48px",
        fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
        color: "#7f0000",
        fontStyle: "bold"
    });
}