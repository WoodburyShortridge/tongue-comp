import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import 'tracking';
import 'tracking/build/data/face-min';
// import * as data from './training/data.json';
import style from './main.css';

// Number of classes to classify
const NUM_CLASSES = 2;
// Webcam and Image size. Must be 227.
const IMAGE_SIZE = 227;
// K value for KNN
const TOPK = 10;

class Main {
  constructor() {
    // Initiate variables
    this.infoTexts = [];
    this.training = -1; // -1 when no class is being trained
    this.loading = 1;
    this.playing = false;
    this.videoPlaying = false;

    // Initiate deeplearn.js math and knn classifier objects
    this.bindPage();

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

    // track and crop face
    this.faceFind = new FaceFind(this.video);

    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'wrappper');
    document.body.appendChild(this.wrapper);

    this.instructions = document.createElement('h1');
    this.instructions.innerText = 'Loading...';
    this.wrapper.appendChild(this.instructions);

    this.tongue = document.createElement('div');
    this.tongue.setAttribute('class', 'tongue loading');
    this.tongue.innerText = '👅';
    this.wrapper.appendChild(this.tongue);

    this.count = document.createElement('div');
    this.count.setAttribute('class', 'count');
    document.body.appendChild(this.count);

    // Create info texts
    for (let i = 0; i < NUM_CLASSES; i++) {
      const div = document.createElement('div');
      div.setAttribute('class', 'score');
      document.body.appendChild(div);
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
        this.video.width = IMAGE_SIZE;
        this.video.height = IMAGE_SIZE;

        this.video.addEventListener('playing', () => this.videoPlaying = true);
        this.video.addEventListener('paused', () => this.videoPlaying = false);
      })
  }

  trainRight() {
    this.instructions.innerText = 'Stick it to the right';
    this.tongue.setAttribute('class', 'right tongue');
    let trainTimer = 5;
    this.count.innerText = trainTimer;
    let trainCount = () => {
      if (trainTimer === -13) {
        this.training = -1;
        this.count.setAttribute('class', 'count');
        this.trainLeft();
        clearInterval(interval);
      }
      else if ( trainTimer > 0) {
        this.count.innerText = trainTimer;
      }
      else if ( trainTimer === 0) {
        this.count.innerText = "🧠"
        this.count.setAttribute('class', 'count train');
      }
      else {
        this.training = 0;
      }
      trainTimer -= 1;
    };
    let interval = setInterval(trainCount, 1000);
  }

  trainLeft() {
    this.instructions.innerText = 'Stick it to the left';
    this.tongue.setAttribute('class', 'left tongue');
    let trainTimer = 5;
    this.count.innerText = trainTimer;
    let trainCount = () => {
      if (trainTimer === -13) {
        this.training = -1;
        this.count.setAttribute('class', 'count');
        this.playGame();
        clearInterval(interval);
      }
      else if ( trainTimer > 0) {
        this.count.innerText = trainTimer;
      }
      else if ( trainTimer === 0) {
        this.count.innerText = "🧠"
        this.count.setAttribute('class', 'count train');
      }
      else {
        this.training = 1;
      }
      trainTimer -= 1;
    };
    let interval = setInterval(trainCount, 1000);
  }

  playGame() {
    this.instructions.innerText = 'Play Game !';
    this.tongue.setAttribute('class', 'play tongue');
    this.count.innerText = '';
    this.playing = true;
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
    this.trainRight();
  }

  stop() {
    this.video.pause();
    cancelAnimationFrame(this.timer);
  }

  // paint routine
  async animate() {
    if (this.videoPlaying) {
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
          const exampleCount = this.knn.getClassExampleCount();

          // Make the predicted class bold
          // if (res.classIndex == i && this.playing) {
          //   this.infoTexts[i].style.fontWeight = 'bold';
          // } else {
          //   this.infoTexts[i].style.fontWeight = 'normal';
          // }

          if (res.confidences[i] > 0.8 && this.playing) {
            this.infoTexts[i].style.fontWeight = 'bold';
          } else {
            this.infoTexts[i].style.fontWeight = 'normal';
          }

          // Update info text
          if (exampleCount[i] > 0 && i === 0 && this.playing) {
            this.infoTexts[i].innerText = ` ${exampleCount[i]} RIGHT - ${res.confidences[i] * 100}%`
          }
          if (exampleCount[i] > 0 && i === 1 && this.playing) {
            this.infoTexts[i].innerText = ` ${exampleCount[i]} LEFT - ${res.confidences[i] * 100}%`
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
  constructor(video) {
    this.video = video;
    this.faceCanvas = document.createElement('canvas');
    this.faceCanvas.setAttribute('id', 'face');
    this.faceContext = this.faceCanvas.getContext('2d');
    document.body.appendChild(this.faceCanvas)

    // create tracker
    this.tracker = new window.tracking.ObjectTracker('face');
    this.tracker.setInitialScale(4);
    this.tracker.setStepSize(2);
    this.tracker.setEdgesDensity(0.1);

    this.trackFace();
  }

  trackFace() {
    let video = this.video;
    let trimFace = this.trimFace;
    let faceContext = this.faceContext;
    let faceCanvas = this.faceCanvas;

    tracking.track(this.video, this.tracker, {camera: true});
    this.tracker.on('track', function(event) {
      event.data.forEach(function(rect) {
        let c1 = document.createElement('canvas');
        let ctx1  = c1.getContext('2d');
        c1.width  = video.width;
        c1.height = video.height;
        ctx1.translate(-rect.x, -rect.y);
        ctx1.drawImage(video, 0, 0, video.width, video.height);

        let c2 = document.createElement('canvas');
        let ctx2 = c2.getContext('2d');
        c2.width = video.width;
        c2.height = video.height;
        ctx2.translate(video.width - rect.width, video.height - rect.height);
        ctx2.drawImage(c1, 0, 0, video.width, video.height);

        let faceCanvasImg = trimFace(c2);

        faceCanvas.width  = 227;
        faceCanvas.height = 227;
        faceContext.drawImage(faceCanvasImg, 0, 0, 227, 227);
      });
    });
  }

  trimFace(c) {
    let ctx = c.getContext('2d');
    let copy = document.createElement('canvas').getContext('2d');
    let pixels = ctx.getImageData(0, 0, c.width, c.height)
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
        x = (i / 4) % c.width;
        y = ~~((i / 4) / c.width);
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
    copy.canvas.width  = trimWidth;
    copy.canvas.height = trimHeight;
    copy.putImageData(trimmed, 0, 0);
    return copy.canvas;
  }
}

window.addEventListener('load', () => new Main());
