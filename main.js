"use strict";

const tileSize = 25;
const gridLength = 9;
const canvasWidth = tileSize * (gridLength + 1) * 2;
const canvasHeight = tileSize * (gridLength + 1);
const canvasSizeRatio = canvasWidth / canvasHeight;

class Game {
	constructor() {
		this.canvas = null;
		this.context = null;
		this.players = [];
		this.you = null;
		this.enemy = null;
		this.waterImage = new Image();
		this.waterImage.src = 'images/water.png';
	}
	
	init() {
		this.you = new Player("You");
		this.enemy = new Player("Opponent");
		
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
		for(var player of this.players)
		{
			this.drawGrid(player);
		}
	}
	
	drawGrid(player) {
		this.context.save();
		this.context.translate(player.boardX, player.boardY);
		
		// Draw grid background.
		for(var y = 0; y < gridLength; y++) {
			for(var x = 0; x < gridLength; x++) {
				this.context.drawImage(this.waterImage, x * tileSize, y * tileSize);
			}
		}
		
		// Draw grid labels.
		this.context.fillStyle = '#000';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		const charCodeA = "A".charCodeAt(0);
		for(var y = 0; y < gridLength; y++) {
			this.context.fillText(String.fromCharCode(charCodeA + y), -tileSize / 2, (y + .5) * tileSize);
		}
		for(var x = 0; x < gridLength; x++) {
			this.context.fillText(x, (x + .5) * tileSize, -tileSize / 2);
		}
		
		// Draw grid lines.
		for(var y = 0; y <= gridLength; y++) {
			this.context.fillRect(0, y * tileSize, gridLength * tileSize, 1);
		}
		for(var x = 0; x <= gridLength; x++) {
			this.context.fillRect(x * tileSize, 0, 1, gridLength * tileSize);
		}
		
		this.context.restore();
	}
}

class Player {
	constructor(name) {
		this.name = name;
		
		// Set the player's board position.
		this.boardX = tileSize;
		this.boardY = tileSize;
		if(game.players.length > 0) {
			this.boardX += (gridLength + 1) * tileSize;
		}
		
		// Create the player's grid.
		this.grid = [];
		for(var x = 0; x < gridLength; x++) {
			this.grid[x] = [];
			for(var y = 0; y < gridLength; y++) {
				this.grid[x][y] = 0;
			}
		}
		game.players.push(this);
	}
}

let game = new Game();

window.onload = () => {
	game.init();
}

window.onresize = () => {
	game.resize();
}