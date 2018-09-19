"use strict";

// Images are 25x25 pixel art. The canvas scales up to fit the screen.
const tileSize = 25;
const gridLength = 9;
const canvasWidth = tileSize * (gridLength + 1) * 2;
const canvasHeight = tileSize * (gridLength + 1);
const canvasSizeRatio = canvasWidth / canvasHeight;
let canvasPixelSize = 0;

class Game {
	constructor() {
		this.canvas = null;
		this.context = null;
		this.players = [];
		this.you = null;
		this.enemy = null;
		this.waterImage = new Image();
		this.waterImage.src = 'images/water.png';
		
		this.mouseX = 0;
		this.mouseY = 0;
		
		this.statePlaceShips = 1;
		this.state = this.statePlaceShips;
		this.shipPlacing = null;
	}
	
	setup() {

		window.onresize = this.resize.bind(game);

		window.addEventListener("mousemove", (ev) => {
			this.mousemove(ev.clientX, ev.clientY);
		});

		window.addEventListener("mouseup", this.mouseup.bind(this));
		
		this.you = new Player("You");
		this.enemy = new Player("Opponent");
		
		this.shipPlacing = this.you.ships[0];
		
		this.canvas = mainCanvas;
		this.canvas.setAttribute('width', canvasWidth);
		this.canvas.setAttribute('height', canvasHeight);
		this.context = this.canvas.getContext('2d');
		
		this.resize();
		this.draw();
	}
	
	resize() {
		if(window.innerWidth / window.innerHeight > canvasSizeRatio) {
			this.canvas.style.width = window.innerHeight * canvasSizeRatio + 'px';
			this.canvas.style.height = "100%";
			canvasPixelSize = window.innerHeight / canvasHeight;
		} else {
			this.canvas.style.width = "100%";
			this.canvas.style.height = window.innerWidth / canvasSizeRatio + 'px';
			canvasPixelSize = window.innerWidth / canvasWidth;
		}
	}
	
	mousemove(x, y) {
		x /= canvasPixelSize;
		y /= canvasPixelSize;
		if(this.shipPlacing && Math.abs(y - this.mouseY) + Math.abs(x - this.mouseX) > 5) {
			if(Math.abs(y - this.mouseY) > Math.abs(x - this.mouseX)) {
				this.shipPlacing.vertical = true;
			} else {
				this.shipPlacing.vertical = false;
			}
		}
		this.mouseX = x;
		this.mouseY = y;
	}
	
	mouseup() {
		if(this.shipPlacing) {
			this.shipPlacing.place();
			this.shipPlacing = null;
			for(let ship of this.you.ships) {
				if(!ship.inGrid) {
					this.shipPlacing = ship;
					break;
				}
			}
		}
	}
	
	draw() {
		window.requestAnimationFrame(this.draw.bind(this));
		this.context.fillStyle = "#89A";
		this.context.fillRect(0,0,canvasWidth,canvasHeight);
		for(let player of this.players)
		{
			this.drawGrid(player);
		}
	}
	
	drawGrid(player) {
		this.context.save();
		this.context.translate(player.boardX, player.boardY);
		
		// Draw grid background.
		for(let y = 0; y < gridLength; y++) {
			for(let x = 0; x < gridLength; x++) {
				this.context.drawImage(this.waterImage, x * tileSize, y * tileSize);
			}
		}
		
		// Draw grid labels.
		this.context.fillStyle = '#000';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		const charCodeA = "A".charCodeAt(0);
		for(let y = 0; y < gridLength; y++) {
			this.context.fillText(String.fromCharCode(charCodeA + y), -tileSize / 2, (y + .5) * tileSize);
		}
		for(let x = 0; x < gridLength; x++) {
			this.context.fillText(x, (x + .5) * tileSize, -tileSize / 2);
		}
		
		// Draw grid lines.
		for(let y = 0; y <= gridLength; y++) {
			this.context.fillRect(0, y * tileSize, gridLength * tileSize, 1);
		}
		for(let x = 0; x <= gridLength; x++) {
			this.context.fillRect(x * tileSize, 0, 1, gridLength * tileSize);
		}
		
		if(this.shipPlacing) {
			let gridX = Math.floor((this.mouseX - this.you.boardX) / tileSize);
			let gridY = Math.floor((this.mouseY - this.you.boardY) / tileSize);
			if(gridX < 0) {
				gridX = 0;
			}
			if(gridY < 0) {
				gridY = 0;
			}
			let width = 1;
			let height = 1;
			if(this.shipPlacing.vertical) {
				height = this.shipPlacing.type.length;
			} else {
				width = this.shipPlacing.type.length;
			}
			if(gridX >= gridLength - width) {
				gridX = gridLength - width;
			}
			if(gridY >= gridLength - height) {
				gridY = gridLength - height;
			}
			this.shipPlacing.x = gridX;
			this.shipPlacing.y = gridY;
		}
		
		// Draw ships.
		for(let ship of player.ships) {
			if(ship.inGrid || ship == this.shipPlacing) {
				ship.draw();
			}
		}
		
		this.context.restore();
	}
}

let game = new Game();
let shipType2 = new ShipType("GunBoat", "ship2.png", 2);
let shipType3 = new ShipType("Destroyer", "ship3.png", 3);
let shipType4 = new ShipType("Cruiser", "ship4.png", 4);

window.onload = game.setup.bind(game);
