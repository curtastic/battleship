"use strict";

class Game {
	constructor() {
	}
	
	init() {
		this.canvas = mainCanvas;
		this.resize();
	}
	
	resize() {
		this.canvas.setAttribute('width', innerWidth);
		this.canvas.setAttribute('height', innerHeight);
	}
}

var game = new Game();

window.onload = () => {
	game.init();
}

window.onresize = () => {
	game.resize();
}