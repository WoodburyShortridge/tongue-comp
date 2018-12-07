import Interface from './interface.js'
import Game from './game.js'

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
