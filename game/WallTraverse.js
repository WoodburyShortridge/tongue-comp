
// Drawing
var canvas, ctx;
var x, y;

// Walls
var walls = []

// Ball 
var ballRad = 10;
var dx = 2;
var ballX, ballY;

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
    }

    drawBall(){
        ctx.beginPath();
        ctx.arc(x, y, ballRad, 0, Math.PI*2);
        ctx.fillStyle = rgb(255, 0, 0);
        ctx.fill();
        ctx.closePath();
    }

}

onload = function (){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    x = canvas.width/2;
    y = canvas.height - 30;

    ballX = (canvas.width - ballRad)/2





    

    
}