import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as data from './training/data.json';
import style from './main.css';

// Number of classes to classify
const NUM_CLASSES = 3;
// Webcam and Image size. Must be 227.
const IMAGE_SIZE = 227;
// K value for KNN
const TOPK = 10;

class Main {
  constructor() {
    // Initiate variables
    this.infoTexts = [];
    this.videoPlaying = false;

    // Initiate deeplearn.js math and knn classifier objects
    this.bindPage();

    // Create video element that will contain the webcam image
    this.video = document.createElement('video');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');

    // Add video element to DOM
    document.body.appendChild(this.video);

    // Create info texts
    for (let i = 0; i < NUM_CLASSES; i++) {
      const div = document.createElement('div');
      document.body.appendChild(div);
      div.style.marginBottom = '10px';

      const infoText = document.createElement('span')
      infoText.innerText = "Data loading....";
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

  // reusable method to load img data
  loadData(dataClass, tfNum) {
    for (let i = 0; i < dataClass.length; i++) {
      let image = new Image();
      image.src = 'training/' + dataClass[i];
      image.width = IMAGE_SIZE;
      image.height = IMAGE_SIZE;

      image.addEventListener('load', () => {
        // document.body.appendChild(image);
        let imageTf = tf.fromPixels(image);
        let infer = () => this.mobilenet.infer(imageTf, 'conv_preds');
        let logits = infer();
        // Add current image to classifier
        this.knn.addExample(logits, tfNum)

        // Dispose image when done
        imageTf.dispose();
        if (logits != null) {
          logits.dispose();
        }
      }, false);
    };
  }

  // async method called from constructor to create classifier, load mobilenet, and data
  async bindPage() {
    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();

    this.loadData(data.right, 0);
    this.loadData(data.left, 1);
    this.loadData(data.none, 2)

    this.start();
  }

  start() {
    if (this.timer) {
      this.stop();
    }
    this.video.play();
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    this.video.pause();
    cancelAnimationFrame(this.timer);
  }

  // paint routine
  async animate() {
    if (this.videoPlaying) {

      const numClasses = this.knn.getNumClasses();
      if (numClasses > 0) {

        // If classes have been added run predict
        const image = tf.fromPixels(this.video);
        let infer = () => this.mobilenet.infer(image, 'conv_preds');
        let logits = infer();
        const res = await this.knn.predictClass(logits, TOPK);

        for (let i = 0; i < NUM_CLASSES; i++) {

          // The number of examples for each class
          const count = this.knn.getClassExampleCount();

          // Make the most predicted class bold
          if (res.classIndex == i) {
            this.infoTexts[i].style.fontWeight = 'bold';
          } else {
            this.infoTexts[i].style.fontWeight = 'normal';
          }

          // Update info text
          if (count[i] > 0) {
            if (i === 0) {
              this.infoTexts[i].innerText = `RIGHT: ${count[i]} data loaded - ${res.confidences[i] * 100}%`
            }
            if (i === 1) {
              this.infoTexts[i].innerText = `LEFT: ${count[i]} data loaded - ${res.confidences[i] * 100}%`
            }
            if (i === 2) {
              this.infoTexts[i].innerText = `NONE: ${count[i]} data loaded - ${res.confidences[i] * 100}%`
            }
          }
        }
      }
    }
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }
}

window.addEventListener('load', () => new Main());
