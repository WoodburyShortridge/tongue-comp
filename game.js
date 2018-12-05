// Drawing
const canvas = document.createElement('canvas');
canvas.setAttribute('class','game');
canvas.width = 480;
canvas.height = 600;
const ctx = canvas.getContext("2d");

const x = canvas.width/2;
const y = 30;

let frameInterval = 0;

// Controls
let leftMove = false;
let rightMove = false;
let invulnCounter = 0;

class Game {
  constructor() {
    // place canvas
    document.body.appendChild(canvas);

    this.metrics = new GameMetrics(3);

    // Create the ball
    let ballRad = 4;
    let ballX = (canvas.width - ballRad)/2;
    let ballY = 60;
    this.ball = new Ball(ballX, ballY, 10);

    this.walls = [];

    // Install callbacks
	document.addEventListener("keydown", this.keyDownHandler, false);
    document.addEventListener("keyup", this.keyUpHandler, false);

    // start Drawing
    this.draw = this.draw.bind(this);
    this.draw()
  }

  draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.ball.draw()

      for (let i=0; i < this.walls.length; i++){
          let onscreen = this.walls[i].moveUp();
          if(!onscreen){
              this.walls.shift()

          }
          this.walls[i].draw();
      }

      this.addWalls();

      this.metrics.draw();

      this.collisionDetection()

      if (rightMove){
          this.ball.moveRight();
      }

      if (leftMove){
          this.ball.moveLeft();
      }

      frameInterval++;
      requestAnimationFrame(this.draw);
  }

  collisionDetection(){
      for(let i = 0; i < this.walls.length; i++){
          if(invulnCounter == 0){
              let collided = this.walls[i].collision(this.ball.x, this.ball.y);
              if (collided){
                  this.metrics.decrementLives();
                  invulnCounter = 100;
              }
          }
      }

      if(invulnCounter > 0){
          invulnCounter--;
      }
  }

  addWalls(){
      if(frameInterval % 125 == 0){
          this.walls.push(new Walls(0))
          frameInterval = 0;
      }
  }


  moveRight(e) {
    if (e === true) {
      rightMove = true;
    }
    else if (e === false) {
      rightMove = false;
    }
  }

  moveLeft(e) {
    if (e === true) {
      leftMove = true;
    }
    else if (e === false) {
      leftMove = false;
    }
  }

  // Keyboard callbacks
  keyDownHandler(e) {
  	if(e.keyCode == 39) {
  		rightMove = true;
  	}
  	else if(e.keyCode == 37) {
  		leftMove = true;
  	}
  }

  keyUpHandler(e) {
  	if(e.keyCode == 39) {
  		rightMove = false;
  	}
  	else if(e.keyCode == 37) {
  		leftMove = false;
  	}
  }
}

class Walls {
    constructor(spawnY){
        //this.spawnY = canvas.height + (Math.random() * canvas.height);
        this.spawnY = canvas.height + spawnY;
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
            // no longer respawning walls, report false when offscreen
            return false
        }
        return true
    }

    collision(objectX, objectY){
        console.log("Collision called")
        if(objectX >= this.x && objectX <= this.x + this.width){
            if(this.y < objectY && this.y + this.height > objectY){
                console.log("Collision occurred")
                return true
            }
        }
        return false
    }

    randSpawn(){
        this.dy = 2;
        // Pick some random wall length
        this.width = (Math.random() * (canvas.width/3)) + canvas.width/3;
        this.height = 30;
        // Pick some wall position -- right, left
        if (Math.random() > 0.5){
            this.x = canvas.width - this.width;
        }else{
            this.x = 0
        }

        this.y = this.spawnY
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
        if (this.lives > 1){
            this.lives--;
        }else{
            this.lives--;
            alert("Game Over")
            document.location.reload()
        }
    }

    draw(){
        ctx.font = "bold 16px Helvetica";
        ctx.fillStyle = "#000000";
        ctx.fillText("Score: " + this.score, 10, 20);
        ctx.fillText("Lives: " + this.lives, 10, 45);

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
        if(this.x < canvas.width - this.radius){
            this.x += 5
        }
    }

    moveLeft(){
        if(this.x > 0 + this.radius){
        this.x -= 5
        }
    }
}

export default Game
