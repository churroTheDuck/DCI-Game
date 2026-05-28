var xVel = 0;
var yVel = 0;
var xPos = 0;
var yPos = 0;
var direction = 0;
var flameLength = 0;

var up = false;
var left = false;
var right = false;

var targetUp = false;
var targetLeft = false;
var targetRight = false;

const SIGNAL_DELAY = 500;
let noiseOffset = 0;
let noiseStep = 0.005;
let terrain = [
    { "x": 0, "y": -20.55 },
    { "x": 4.7, "y": -24.4 },
    { x: 9.05, y: -31.55 },
    { x: 13.85, y: -36.8 },
    { "x": 18.6, "y": -41.05 },
    { "x": 20.95, "y": -44.9 },
    { "x": 25.3, "y": -49.15 },
    { "x": 27.6, "y": -53.05 },
    { "x": 32.4, "y": -54.95 },
    { "x": 37.15, "y": -61.1 },
    { "x": 42, "y": -62.1 },
    { "x": 46.35, "y": -65.4, pad: true },
    { "x": 51.05, "y": -65.4, pad: true },
    { "x": 55.8, "y": -64.5 },
    { "x": 60.5, "y": -61.1 },
    { "x": 61.6, "y": -57.25 },
    { "x": 64.85, "y": -53.05 },
    { "x": 66.25, "y": -49.15 },
    { "x": 69.7, "y": -44.9 },
    { "x": 70.6, "y": -41.05 },
    { "x": 74.4, "y": -36.8, pad: true },
    { "x": 79.25, "y": -36.8, pad: true },
    { "x": 82.6, "y": -44.75 },
    { "x": 85.9, "y": -46.85 },
    { "x": 89.75, "y": -44.9 },
    { "x": 93.05, "y": -41.15 },
    { "x": 95.45, "y": -32.9 },
    { "x": 102, "y": -28.65 },
    { "x": 103.6, "y": -16.25 },
    { "x": 106.85, "y": -4.4 },
    { "x": 106.85, "y": 0 }
]

function preload() {
    lunarLander = loadImage("lunarLander.svg");
    flame = loadImage("flame.svg")
    bender = loadFont("bender_light-webfont.ttf");
}

function setup() {
    frameRate(60);
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);
    rectMode(CENTER);
    angleMode(DEGREES);
    xPos = 50;
    yPos = 50;
    xVel = 0.5;
}

function draw() {
    background(0);
    push();
    fill(0);
    stroke(255);
    beginShape();
    for (let i = 0; i < terrain.length - 1; i++) {
        let p1 = terrain[i];
        let p2 = terrain[i + 1];

        if (p1.pad && p2.pad && p1.y === p2.y) {
            stroke("lime"); // highlight pad
            strokeWeight(3);
        } else {
            stroke(255);
            strokeWeight(1);
        }

        line(p1.x * 14, 8 * p1.y + height,
            p2.x * 14, 8 * p2.y + height);
    }
    endShape();
    pop();
    push();
    scale(2);
    translate(xPos, yPos);
    rotate(abs(0 - direction) <= 4 ? 0 : direction);
    image(lunarLander, 0, 0, 30, 30 * (lunarLander.height / lunarLander.width));
    imageMode(CORNERS);
    if (flameLength > 0) {
        image(flame, -5, 15 * (lunarLander.height / lunarLander.width) - 2, 5, 15 * (lunarLander.height / lunarLander.width) - 2 + flameLength + random() * 10);
    }
    pop();
    // lander

    push();
    if (up) {
        xVel += 0.005 * sin(direction);
        yVel -= 0.005 * cos(direction);
        if (flameLength <= 10 * (flame.height / flame.width)) {
            flameLength += 4
        }
    }
    if (left) {
        if (direction > -90) {
            direction -= 2;
        }
    }
    if (right) {
        if (direction < 90) {
            direction += 2;
        }
    }
    xPos += xVel;
    yPos += yVel;
    yVel += 0.003;
    if (flameLength > 0) {
        flameLength -= 2;
    }
    pop();
    // controls

    push();
    scale(1);
    fill("white");
    textSize(20)
    textAlign(LEFT);
    textFont(bender);
    text("HORIZONTAL SPEED", width - 300, 100);

    fill("white");
    textSize(20)
    textAlign(RIGHT);
    textFont(bender);
    text(Math.round(xVel * 20), width - 50, 100);

    fill("white");
    textSize(20)
    textAlign(LEFT);
    textFont(bender);
    text("VERTICAL SPEED", width - 300, 150);

    fill("white");
    textSize(20)
    textAlign(RIGHT);
    textFont(bender);
    text(Math.round(yVel * 20), width - 50, 150);

    fill("white");
    textSize(20)
    textAlign(LEFT);
    textFont(bender);
    text("DIRECTION", width - 300, 200);

    fill("white");
    textSize(20);
    textAlign(RIGHT);
    textFont(bender);
    text(abs(0 - direction) <= 4 ? "0" : direction, width - 50, 200);
    pop();

    push();
    translate(width - 250, 250);
    stroke("green");
    line(50, -25, 50, 25);
    rotate(direction);
    image(lunarLander, 0, 0, 50, 50 * (lunarLander.height / lunarLander.width));
    pop();

    push();
    translate(width - 200, 275);
    rotate(direction);
    if (abs(round(direction % 180)) <= 4) {
        stroke("green")
    } else if (abs(round(direction % 180)) <= 16) {
        stroke("yellow")
    } else {
        stroke("red")
    }
    line(0, 0, 0, -50)
    pop();
    // info displays

    detectCollision();
}

function detectCollision() {
    let scaledTerrain = terrain.map(p => ({
        x: p.x * 14,
        y: 8 * p.y + height,
        pad: p.pad || false
    }));

    let landerWidth = 30 * 2;
    let landerHeight = 30 * (lunarLander.height / lunarLander.width) * 2;

    let legs = [
        { x: -landerWidth / 2, y: landerHeight / 2 },
        { x: landerWidth / 2, y: landerHeight / 2 }
    ];

    let angle = direction;

    for (let leg of legs) {
        let rotatedX = leg.x * cos(angle) - leg.y * sin(angle);
        let rotatedY = leg.x * sin(angle) + leg.y * cos(angle);

        let worldX = xPos * 2 + rotatedX;
        let worldY = yPos * 2 + rotatedY;

        for (let i = 0; i < scaledTerrain.length - 1; i++) {
            let p1 = scaledTerrain[i];
            let p2 = scaledTerrain[i + 1];

            if (worldX >= p1.x && worldX <= p2.x) {
                let t = (worldX - p1.x) / (p2.x - p1.x);
                let groundY = lerp(p1.y, p2.y, t);

                if (worldY >= groundY) {

                    let isPad = p1.pad && p2.pad && p1.y === p2.y;

                    let safeSpeed = abs(yVel) < 0.3;
                    let safeAngle = abs(direction) <= 4;

                    if (isPad && safeSpeed && safeAngle) {
                        console.log("Perfect Landing");
                    } else if (isPad && safeAngle) {
                        console.log("Hard Landing");
                    } else {
                        console.log("Crash");
                    }

                    noLoop();
                }
                break;
            }
        }
    }
}

function delayedSet(control, value) {
    setTimeout(() => {
        if (control === "up") {
            up = value;
        }
        if (control === "left") {
            left = value;
        }
        if (control === "right") {
            right = value;
        }
    }, SIGNAL_DELAY);
}

function keyPressed() {
    if (keyCode == UP_ARROW) {
        targetUp = true;
        delayedSet("up", true);
    }

    if (keyCode == LEFT_ARROW) {
        targetLeft = true;
        delayedSet("left", true);
    }

    if (keyCode == RIGHT_ARROW) {
        targetRight = true;
        delayedSet("right", true);
    }
}

function keyReleased() {
    if (keyCode == UP_ARROW) {
        targetUp = false;
        delayedSet("up", false);
    }

    if (keyCode == LEFT_ARROW) {
        targetLeft = false;
        delayedSet("left", false);
    }

    if (keyCode == RIGHT_ARROW) {
        targetRight = false;
        delayedSet("right", false);
    }
}