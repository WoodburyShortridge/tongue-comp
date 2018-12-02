
// Drawing
var canvas, ctx;
var x, y;

// Walls
//var walls = []

// Ball 
var ballRad = 10;
var dx = 2;

// controls
var leftMove = false;
var rightMove = false;


var ball;
var walls;
var wall1;

// class Walls
// An individual obstacle is made with one wall on each side of the screen
class Walls {
    constructor(x, y, dy, width, height){
        this.dy = dy
        this.width = width// 30
        this.height = height//10
        this.x = x
        this.y = y
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
        this.x += 2
    }

    moveLeft(){
        this.x -= 2
    }

}


onload = function (){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    x = canvas.width/2;
    y = 30;

    // Create the ball
    let ballX = (canvas.width - ballRad)/2;
    let ballY = 30;
    ball = new Ball(ballX, ballY, 10);

    // Need walls to respawn themselves when off screen.
    // Pick some random wall length
    // Pick some wall position -- right, left
    // Create a wall
    let dy = 5;
    let width = 30;
    let height = 10;
    let wallX = canvas.width/2
    let wallY = canvas.height - height

    wall1 = new Walls(wallX, wallY, dy, width, height);
    walls = [];
    walls.push(wall1);

    // Install callbacks
	document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    
    //drawBall = ball.draw.bind(ball);
    draw()
}


function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ball.draw()
    //wall1.draw();

    //console.log(wall1)
    //console.log(walls)

    for (i=0; i < walls.length; i++){
        //console.log(walls[i]);
        walls[i].draw();
        walls[i].moveUp();
    }


    if (rightMove){
        ball.moveRight();
    }

    if (leftMove){
        ball.moveLeft();
    }

    requestAnimationFrame(draw);
}

function collisionDetection() {
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