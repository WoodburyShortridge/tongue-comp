
// Drawing
var canvas, ctx;
var x, y;

// Controls
var leftMove = false;
var rightMove = false;

// Sprites
var ball;
var walls;

// Score
var metrics;
var invulnCounter = 0;

// class Walls
// An individual obstacle is made with one wall on each side of the screen
class Walls {
    /*constructor(x, y, dy, width, height){
        this.dy = dy
        this.width = width// 30
        this.height = height//10
        this.x = x
        this.y = y
        this.draw = this.draw.bind(this);
    }*/

    constructor(){
        this.randSpawn();
        this.draw = this.draw.bind(this);
    }


    draw() {
        ctx.beginPath();
        ctx.rect(this.x,this.y, this.width, this.height)
        ctx.fillStyle = "#228B22"
        ctx.fill()
        ctx.closePath();
    }

    moveUp() {
        this.y -= this.dy;
        if(this.y < 0 - this.height){
            // respawn
            console.log("offscreen");
            this.randSpawn();
        }
    }

    randSpawn(){
        this.dy = 5;
        this.width = (Math.random() * (canvas.width/4)) + canvas.width/3;
        this.height = 30;
        if (Math.random() > 0.5){
            this.x = canvas.width - this.width;
        }else{
            this.x = 0
        }
        this.y = canvas.height + (Math.random() * canvas.height);
    }



}

class GameMetrics {
    constructor(lives){
        this.lives = lives;
        this.score = 0;
    }

    updateScore(){
        this.score++;
    }

    decrementLives(){
        if (this.lives > 0){
            this.lives--;
        }
    }

    draw(){
        ctx.font = "16px Helvetica";
        ctx.fillStyle = "#000000";
        ctx.fillText("Score: " + this.score, 10, 20);
        ctx.fillText("Lives " + this.lives, 10, 45);

    }
}
class Ball {

    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.draw = this.draw.bind(this)
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = "#ff0000";
        ctx.fill();
        ctx.closePath();
    }

    moveRight(){
        this.x += 5
    }

    moveLeft(){
        this.x -= 5
    }

}


onload = function (){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    x = canvas.width/2;
    y = 30;

    metrics = new GameMetrics(4);

    // Create the ball
    let ballRad = 4;
    let ballX = (canvas.width - ballRad)/2;
    let ballY = 30;
    ball = new Ball(ballX, ballY, 10);

    // Need walls to respawn themselves when off screen.
    // Pick some random wall length
    // Pick some wall position -- right, left
    // Create a 'spawn time delay' by picking some random location further
    // off the screen to appear from, takes longer to get back on
    // Create a wall

    walls = [];
    for (let i = 0; i < 5; i++){
        var wall1 = new Walls();
        walls.push(wall1);
    }


    // Install callbacks
	document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    
    draw()
}


function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.draw()

    for (i=0; i < walls.length; i++){
        //console.log(walls[i]);
        walls[i].draw();
        walls[i].moveUp();
    }

    metrics.draw();

    collisionDetection()

    if (rightMove){
        ball.moveRight();
    }

    if (leftMove){
        ball.moveLeft();
    }

    requestAnimationFrame(draw);
}

function collisionDetection () {
    for(var i = 0; i < walls.length; i++){
        if(walls[i].x < ball.x && walls[i].x + walls[i].width > ball.x){
            if(walls[i].y < ball.y && walls[i].y + walls[i].height > ball.y){
                if(invulnCounter == 0){
                    console.log("collision");
                    metrics.decrementLives();
                    invulnCounter = 100;
                }
            }
        }
    }
    
    if(invulnCounter > 0){
        invulnCounter--;
    }

}


// Keyboard callbacks
function keyDownHandler(e) {
	if(e.keyCode == 39) {
		rightMove = true;
	}
	else if(e.keyCode == 37) {
		leftMove = true;
	}
}

function keyUpHandler(e) {
	if(e.keyCode == 39) {
		rightMove = false;
	}
	else if(e.keyCode == 37) {
		leftMove = false;
	}
}