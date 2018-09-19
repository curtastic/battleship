"use strict";

const tileSize = 25;
const gridLength = 9;
const canvasWidth = tileSize * (gridLength + 1) * 2;
const canvasHeight = tileSize * (gridLength + 1);
const canvasSizeRatio = canvasWidth / canvasHeight;

class Game {
	constructor() {
	}
	
	init() {
		this.canvas = mainCanvas;
		this.canvas.setAttribute('width', canvasWidth);
		this.canvas.setAttribute('height', canvasHeight);
		this.context = this.canvas.getContext('2d');
		
		this.resize();
	}
	
	resize() {
		if(innerWidth / innerHeight > canvasSizeRatio)
		{
			this.canvas.style.width = innerHeight * canvasSizeRatio + 'px';
			this.canvas.style.height = "100%";
		}
		else
		{
			this.canvas.style.width = "100%";
			this.canvas.style.height = innerWidth / canvasSizeRatio + 'px';
		}
		this.draw();
	}
	
	draw() {
		this.context.fillStyle = "#89A";
		this.context.fillRect(0,0,canvasWidth,canvasHeight);
	}
}

var game = new Game();

window.onload = () => {
	game.init();
}

window.onresize = () => {
	game.resize();
}