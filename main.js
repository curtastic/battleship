"use strict";

// Images are 25x25 pixel art. The canvas scales up to fit the screen.
const tileSize = 25;
const gridLength = 8;
const canvasWidth = tileSize * ((gridLength + 1) * 2 + 1);
const canvasHeight = tileSize * (gridLength + 3);
const canvasSizeRatio = canvasWidth / canvasHeight;
let canvasPixelSize = 0;

const randomInt = (low, high) => {
	return Math.floor(Math.random() * (high - low + 1) + low);
}

class Game {
	constructor() {
		this.canvas = null;
		this.context = null;
		this.players = [];
		this.you = null;
		this.enemy = null;
		this.loops = 0;
		
		this.waterImage = new Image();
		this.waterImage.src = 'images/water.png';
		
		this.crosshairImage = new Image();
		this.crosshairImage.src = 'images/crosshair.png';
		
		this.craterImage = new Image();
		this.craterImage.src = 'images/crater.png';
		
		this.mouseX = 0;
		this.mouseY = 0;
		
		this.statePlaceShips = 1;
		this.stateChooseTarget = 2;
		this.stateEnemyChooseTarget = 3;
		this.stateWin = 4;
		this.stateLose = 5;
		this.state = this.statePlaceShips;
		
		this.shipPlacing = null;
		this.shipType2 = new ShipType("GunBoat", "ship2.png", 2);
		this.shipType3 = new ShipType("Destroyer", "ship3.png", 3);
		this.shipType4 = new ShipType("Cruiser", "ship4.png", 4);

		window.onload = this.setup.bind(this);
	}
	
	setup() {

		// Setup input events.
		window.onresize = this.resize.bind(game);

		window.addEventListener("mousemove", (ev) => {
			this.mousemove(ev.clientX, ev.clientY);
		});

		window.addEventListener("mouseup", this.mouseup.bind(this));
		
		// Make players.
		this.you = new Player("You");
		this.players.push(this.you);
		
		this.enemy = new Player("Opponent");
		this.players.push(this.enemy);
		this.enemy.boardX += (gridLength + 1) * tileSize;
		
		this.you.otherPlayer = this.enemy;
		this.enemy.otherPlayer = this.you;
		
		// Setup canvas.
		this.canvas = mainCanvas;
		this.canvas.setAttribute('width', canvasWidth);
		this.canvas.setAttribute('height', canvasHeight);
		this.context = this.canvas.getContext('2d');
		
		// Start game.
		this.shipPlacing = this.you.ships[0];
		this.shipPlacing.placing = true;
		this.resize();
		this.mainLoop();
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
					ship.placing = true;
					break;
				}
			}
			
			if(!this.shipPlacing) {
				this.enemy.AIPlaceShips();
				this.state = this.stateChooseTarget;
			}
			
		} else if(this.state === this.stateChooseTarget) {
			if(this.you.canTarget()) {
				this.enemy.takeHit(this.you.targetX, this.you.targetY);
				if(this.enemy.checkIfLost()) {
					this.state = this.stateWin;
				} else {
					this.state = this.stateEnemyChooseTarget;
					this.enemy.AIChooseTarget();
				}
			}
		}
	}
	
	mainLoop() {
		window.requestAnimationFrame(this.mainLoop.bind(this));
		this.update();
		this.draw();
	}
	
	update() {
		// Position the ship you're placing.
		if(this.shipPlacing) {
			this.updateShipPlacing();
		}
		
		// Update the crosshair position.
		if(this.state === this.stateChooseTarget || this.state === this.stateEnemyChooseTarget) {
			this.updateTarget();
		}
		
		this.loops++;
	}
	
	updateShipPlacing() {
		// Convert mouse coordinates to grid tile.
		let gridX = Math.floor((this.mouseX - this.you.boardX) / tileSize);
		let gridY = Math.floor((this.mouseY - this.you.boardY) / tileSize);
		
		// Keep ship in grid bounds.
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
	
	updateTarget() {
		if(this.state === this.stateChooseTarget) {
			// Convert mouse coordinates to grid tile.
			let gridX = Math.floor((this.mouseX - this.enemy.boardX) / tileSize);
			let gridY = Math.floor((this.mouseY - this.enemy.boardY) / tileSize);
			
			// Keep target in grid bounds.
			if(gridX < 0) {
				gridX = 0;
			} else if(gridX > gridLength - 1) {
				gridX = gridLength - 1;
			}
			
			if(gridY < 0) {
				gridY = 0;
			} else if(gridY > gridLength - 1) {
				gridY = gridLength - 1;
			}
			
			this.you.targetX = gridX;
			this.you.targetY = gridY;
		} else {
			// The enemy moves the target to its destination.
			if(this.loops % 14 === 0) {
				this.enemy.targetX += Math.sign(this.enemy.targetDestX - this.enemy.targetX);
				this.enemy.targetY += Math.sign(this.enemy.targetDestY - this.enemy.targetY);
				if(this.enemy.targetX === this.enemy.targetDestX && this.enemy.targetY === this.enemy.targetDestY) {
					this.you.takeHit(this.enemy.targetX, this.enemy.targetY);
					if(this.you.checkIfLost()) {
						this.state = this.stateLose;
					} else {
						this.state = this.stateChooseTarget;
					}
				}
			}
		}
	}
	
	draw() {
		// Clear the canvas.
		this.context.fillStyle = "#89A";
		this.context.fillRect(0, 0, canvasWidth, canvasHeight);
		
		// Draw player grids.
		for(let player of this.players)
		{
			this.drawGrid(player);
		}
		
		// Draw state message.
		this.context.fillStyle = "#222";
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.font = 'bold 20px Courier';
		if(this.state === this.statePlaceShips) {
			let total = 0;
			for(let ship of this.you.ships) {
				if(!ship.inGrid) {
					total++;
				}
			}
			this.context.fillText("Place Your Ships (" + total + ")", canvasWidth / 2, tileSize / 2);
		} else if(this.state === this.stateChooseTarget) {
			this.context.fillText("Choose Target", canvasWidth / 2, tileSize / 2);
		} else if(this.state === this.stateEnemyChooseTarget) {
			this.context.fillText("Enemy Is Targeting...", canvasWidth / 2, tileSize / 2);
		} else if(this.state === this.stateWin) {
			if(this.loops % 30 < 15) {
				this.context.fillStyle = "#222";
			} else {
				this.context.fillStyle = "#2C2";
			}
			this.context.fillText("YOU WIN!", canvasWidth / 2, tileSize / 2);
		} else if(this.state === this.stateLose) {
			if(this.loops % 30 < 15) {
				this.context.fillStyle = "#222";
			} else {
				this.context.fillStyle = "#F22";
			}
			this.context.fillText("YOU LOSE!", canvasWidth / 2, tileSize / 2);
		}
	}
	
	drawGrid(player) {
		this.context.save();
		this.context.translate(player.boardX, player.boardY);
		
		// Draw grid background.
		for(let y = 0; y < gridLength; y++) {
			for(let x = 0; x < gridLength; x++) {
				this.context.drawImage(this.waterImage, x * tileSize, y * tileSize);
				if(player.grid[x][y] === 1) {
					this.context.drawImage(this.craterImage, x * tileSize, y * tileSize);
				}
			}
		}
		
		// Draw grid labels.
		this.context.font = '14px Courier';
		this.context.fillStyle = '#666';
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
		this.context.fillStyle = '#000';
		for(let y = 0; y <= gridLength; y++) {
			this.context.fillRect(0, y * tileSize, gridLength * tileSize, 1);
		}
		for(let x = 0; x <= gridLength; x++) {
			this.context.fillRect(x * tileSize, 0, 1, gridLength * tileSize);
		}
		
		// Draw ships.
		for(let ship of player.ships) {
			if(ship.inGrid || ship === this.shipPlacing) {
				if(ship.player === this.you || ship.sunk) {
					ship.draw(this.context);
				}
			}
		}
		
		// Draw the crosshair.
		if(this.state === this.stateChooseTarget && player === this.enemy) {
			this.context.drawImage(this.crosshairImage, this.you.targetX * tileSize, this.you.targetY * tileSize);
		}
		if(this.state === this.stateEnemyChooseTarget && player === this.you) {
			this.context.drawImage(this.crosshairImage, this.enemy.targetX * tileSize, this.enemy.targetY * tileSize);
		}
		
		this.context.restore();
	}
	
}

let game = new Game();
