import Interface from './interface.js'
import Game from './game.js'
import style from './main.css';

class Main {
  constructor() {
    this.interface = new Interface(this);
    this.game = null;
  }
  makeGame() {
    this.game = new Game(this);
  }
}

window.addEventListener('load', () => new Main());
