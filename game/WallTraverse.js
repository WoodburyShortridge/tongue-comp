
// Drawing
var canvas, ctx;
var x, y;

// Walls
//var walls = []

// Ball 
var ballRad = 10;
var dx = 2;

// controls
leftMove = false;
rightMove = false;



// class Walls
// An individual obstacle is made with one wall on each side of the screen
class Walls {
    constructor(x, y, dy, width, height){
        this.dy = -2
        this.width = 30
        this.height = 10
        this.x = 0
        this.y = 0
    }

    drawWall(wall) {
        ctx.beginPath();
        ctx.rect(wall.x, wall.y, wall.width, wall.height)

    }

}


class Ball {

    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.drawBall = this.drawBall.bind(this)
    }

    drawBall(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = "#ff0000";
        ctx.fill();
        ctx.closePath();
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
    let ball = new Ball(ballX, ballY, 10);
    //ball.drawBall();

    // Install callbacks
	document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    
    //var dBall = ball.drawBall;
    //dBall()
    //var dBall = ball.drawBall.bind(ball);
    //dBall();
    //draw(dBall, []);
    //var dBall = (() => ball.drawBall());
    //dBall
    //ob = (function(){ball.drawBall()});
    //ob()
    //var ob = (function(){console.log("Hi")})
    //var ob = () => console.log("Hi");
    //draw(ob, []);

    draw(ball.drawBall.bind(ball))
}

function draw(dBall){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dBall();
    
    //ball.drawBall().bind(ball);
    //ball.drawBall();

    if (rightMove){
        //ball.x += 2;
    }

    if (leftMove){
        //ball.x -= 2;
    }

    requestAnimationFrame(draw(dBall));
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