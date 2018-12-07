import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import 'tracking';
import 'tracking/build/data/face-min';

// classes
const NUM_CLASSES = 2;
// Webcam
const VIDEO_SIZE = 400;
// Image size. Must be 227 for tfjs
const IMG_SIZE = 227;
// K value for KNN
const TOPK = 10;

const BEEP = new Audio('./beep.mp3');

class Interface {
  constructor(parent) {
    this.parent = parent;

    // Initiate variables
    this.infoTexts = [];
    this.exampleCount = [0,0];
    this.training = -1;
    this.playing = false;
    this.videoPlaying = false;

    // Create video element that will contain the webcam image
    this.video = document.createElement('video');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('preload', '');
    this.video.setAttribute('loop', '');
    this.video.setAttribute('muted', '');
    // Add video element to DOM
    document.body.appendChild(this.video);

    // create training class
    this.train = new Training(this);

    // create face find class
    this.faceFind = new FaceFind(this);

    // Create inference view
    this.view = document.createElement('div');
    document.body.appendChild(this.view);
    for (let i = 0; i < NUM_CLASSES; i++) {
      const div = document.createElement('div');
      div.setAttribute('class', 'score');
      this.view.appendChild(div);
      div.style.marginBottom = '10px';

      // Create info text
      const infoText = document.createElement('span')
      infoText.innerText = "";
      div.appendChild(infoText);
      this.infoTexts.push(infoText);
    }

    // Setup webcam
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.width = VIDEO_SIZE;
        this.video.height = VIDEO_SIZE;

        this.video.addEventListener('playing', () => this.videoPlaying = true);
        this.video.addEventListener('paused', () => this.videoPlaying = false);
      })

    // Initiate tfjs & knn classifier objects
    this.bindPage();
  }

  // async method called from constructor to create classifier, load mobilenet, and data
  async bindPage() {
    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();
    this.start();
  }

  start() {
    if (this.timer) {
      this.stop();
    }
    this.video.play();
    this.timer = requestAnimationFrame(this.animate.bind(this));

    // reset bounding/crop box only every second for speed
    setInterval( () => { this.faceFind.trackFace(); }, 1000);

    // start training on right side
    this.train.trainRight();
  }

  stop() {
    this.video.pause();
    cancelAnimationFrame(this.timer);
  }

  // paint routine
  async animate() {
    if (this.videoPlaying) {

      // trim face with most recent bounding box
      this.faceFind.trimFace();

      // draw box showing tri,
      this.faceFind.drawBox();

      // Get image data from video element
      const image = tf.fromPixels(this.faceFind.faceCanvas);

      let logits;
      // 'conv_preds' is the logits activation of MobileNet.
      const infer = () => this.mobilenet.infer(image, 'conv_preds');

      // Train class if one of the buttons is held down
      if (this.training != -1) {
        logits = infer();

        // Add current image to classifier
        this.knn.addExample(logits, this.training)
      }

      const numClasses = this.knn.getNumClasses();
      if (numClasses > 0) {

        // If classes have been added run predict
        logits = infer();
        const res = await this.knn.predictClass(logits, TOPK);

        for (let i = 0; i < NUM_CLASSES; i++) {

          // The number of examples for each class
          this.exampleCount = this.knn.getClassExampleCount();

          if (res.confidences[i] > 0.8 && this.playing) {
            this.infoTexts[i].style.fontWeight = 'bold';
            // Control Game
            if (i === 0) {
              this.parent.game.moveRight(true);
            }
            else if (i === 1) {
              this.parent.game.moveLeft(true);
            }
          } else if (this.playing) {
            this.infoTexts[i].style.fontWeight = 'normal';
            // Stop control Game
            if (i === 0) {
              this.parent.game.moveRight(false);
            }
            else if (i === 1) {
              this.parent.game.moveLeft(false);
            }
          }

          // Update info text
          if (this.exampleCount[i] > 0 && i === 0 && this.playing) {
            this.infoTexts[i].innerText = `RIGHT - ${res.confidences[i] * 100}%`
          }
          if (this.exampleCount[i] > 0 && i === 1 && this.playing) {
            this.infoTexts[i].innerText = `LEFT - ${res.confidences[i] * 100}%`
          }
        }
      }

      // Dispose image when done
      image.dispose();
      if (logits != null) {
        logits.dispose();
      }
    }
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }
}

class FaceFind {
  constructor(parent) {
    this.parent = parent;

    // Create canvas for showing box
    this.boxCanvas = document.createElement('canvas');
    this.boxCanvas.setAttribute('class', 'box');
    this.boxContext = this.boxCanvas.getContext('2d');
    this.boxCanvas.width  = VIDEO_SIZE;
    this.boxCanvas.height = VIDEO_SIZE;
    // Add to DOM
    document.body.appendChild(this.boxCanvas)

    this.faceCanvas = document.createElement('canvas');
    this.faceContext = this.faceCanvas.getContext('2d');
    this.faceCanvas.width  = IMG_SIZE;
    this.faceCanvas.height = IMG_SIZE;

    // init bounding box
    this.rect = {
      width: 100,
      height: 100,
      x: 100,
      y: 100
    }

    // create tracker
    this.tracker = new window.tracking.ObjectTracker('face');
    this.tracker.setInitialScale(4);
    this.tracker.setStepSize(1.5);
    this.tracker.setEdgesDensity(0.1);
  }

  trackFace() {
    if (this.parent.videoPlaying) {
      let canvas = document.createElement("canvas");
      canvas.width = this.parent.video.width;
      canvas.height = this.parent.video.height;
      canvas.getContext('2d').drawImage(this.parent.video, 0, 0, canvas.width, canvas.height);

      let img = document.createElement("img");
      img.src = canvas.toDataURL("image/jpeg");
      img.width = VIDEO_SIZE;
      img.height = VIDEO_SIZE;
      // document.body.appendChild(img);
      tracking.track(img, this.tracker);
      // update bounding box
      this.setBox = (rect) => {
        // offset for focus on tongue
        let offset = rect.height / 2.5;
        let offset2 = rect.height / 4

        this.rect.width = rect.width - offset2;
        this.rect.height = rect.height - offset2;
        this.rect.x = rect.x + (offset2 / 2);
        this.rect.y = rect.y + offset;
      }

      this.tracker.on('track', (event) => {
        event.data.forEach( (rect) => {
          this.setBox(rect);
        });
      });
    }
  }

  drawBox() {
    this.boxContext.clearRect(0, 0, this.parent.video.width, this.parent.video.height);
    this.boxContext.strokeStyle = '#66ff00';
    this.boxContext.lineWidth=3;
    this.boxContext.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
  }

  trimFace() {
    // make copy of video and trim around bounding box
    let c1 = document.createElement('canvas');
    let ctx1  = c1.getContext('2d');
    c1.width  = this.parent.video.width;
    c1.height = this.parent.video.height;
    ctx1.translate(-this.rect.x, -this.rect.y);
    ctx1.drawImage(this.parent.video, 0, 0, this.parent.video.width, this.parent.video.height);

    let c2 = document.createElement('canvas');
    let ctx2 = c2.getContext('2d');
    c2.width = this.parent.video.width;
    c2.height = this.parent.video.height;
    ctx2.translate(this.parent.video.width - this.rect.width, this.parent.video.height - this.rect.height);
    ctx2.drawImage(c1, 0, 0, this.parent.video.width, this.parent.video.height);

    let ctx = c2.getContext('2d');
    let copy = document.createElement('canvas');
    let copyContext = copy.getContext('2d');
    let pixels = ctx.getImageData(0, 0, c2.width, c2.height)
    let l = pixels.data.length
    let i
    let bound  = {
      top:    null,
      left:   null,
      right:  null,
      bottom: null
    }
    let x, y
    for(let i = 0; i<l; i += 4) {
      if(pixels.data[i + 3]!==0) {
        x = (i / 4) % c2.width;
        y = ~~((i / 4) / c2.width);
        if(bound.top===null) {
          bound.top = y;
        }
        if(bound.left===null) {
          bound.left = x;
        } else if(x<bound.left) {
          bound.left = x;
        }
        if(bound.right===null) {
          bound.right = x;
        } else if(bound.right<x) {
          bound.right = x;
        }
        if(bound.bottom===null) {
          bound.bottom = y;
        } else if(bound.bottom<y) {
          bound.bottom = y;
        }
      }
    }
    let trimHeight = bound.bottom - bound.top;
    let trimWidth = bound.right - bound.left;
    let trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);
    copy.width  = trimWidth;
    copy.height = trimHeight;
    copyContext.putImageData(trimmed, 0, 0);
    this.faceContext.drawImage(copy, 0, 0, IMG_SIZE, IMG_SIZE);
  }
}

class Training {
  constructor(parent) {
    this.parent = parent;
  }

  trainRight() {
    this.parent.parent.instructions.innerHTML = 'Stick it to the <u>right</u>';
    this.parent.parent.tongue.setAttribute('class', 'right tongue');
    let trainTimer = 3;
    this.parent.parent.count.innerText = trainTimer;
    BEEP.play();
    let trainCountDown = () => {
      if (trainTimer > 0) {
        BEEP.play();
        trainTimer -= 1;
        this.parent.parent.count.innerText = trainTimer;
      } else {
        clearInterval(interval);
        training();
      }
    }

    let interval = setInterval(trainCountDown, 1000);

    let training = () => {
      if (this.parent.exampleCount[0] > 100) {
        this.parent.training = -1;
        this.parent.parent.count.setAttribute('class', 'count');
        this.trainLeft();
      }
      else if ( this.parent.exampleCount[0] === 0) {
        this.parent.parent.count.innerText = "🧠"
        this.parent.parent.count.setAttribute('class', 'count train');
        this.parent.training = 0;
        setTimeout(training, 250);
      }
      else {
        setTimeout(training, 250);
      }
    };
  }

  trainLeft() {
    this.parent.parent.instructions.innerHTML = 'Stick it to the <u>left</u>';
    this.parent.parent.wrapper.setAttribute('class', 'wrapper left');
    this.parent.parent.tongue.setAttribute('class', 'left tongue');
    let trainTimer = 3;
    this.parent.parent.count.innerText = trainTimer;
    this.parent.exampleCount[1] = 0;
    BEEP.play();
    let trainCountDown = () => {
      if (trainTimer > 0) {
        BEEP.play();
        trainTimer -= 1;
        this.parent.parent.count.innerText = trainTimer;
      } else {
        clearInterval(interval);
        training();
      }
    }

    let interval = setInterval(trainCountDown, 1000);

    let training = () => {
      if (this.parent.exampleCount[1] > 100) {
        this.parent.training = -1;
        this.parent.parent.count.setAttribute('class', 'count');
        this.parent.parent.playGame();
      }
      else if ( this.parent.exampleCount[1] === 0) {
        this.parent.parent.count.innerText = "🧠"
        this.parent.parent.count.setAttribute('class', 'count train');
        this.parent.training = 1;
        setTimeout(training, 250);
      }
      else {
        setTimeout(training, 250);
      }
    };
  }
}

export default Interface;
