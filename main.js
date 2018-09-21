"use strict";

class Game {
	constructor() {
		this.canvas = null;
		this.context = null;
		this.canvasPixelSize = 0;
		this.players = [];
		this.you = null;
		this.enemy = null;
		this.loops = 0;
		
		this.mouseX = 0;
		this.mouseY = 0;
		
		// Game images.
		this.waterImage = new Image();
		this.waterImage.src = 'images/water.png';
		
		this.crosshairImage = new Image();
		this.crosshairImage.src = 'images/crosshair.png';
		
		this.hitImage = new Image();
		this.hitImage.src = 'images/crater.png';
		
		this.missImage = new Image();
		this.missImage.src = 'images/miss.png';
		
		// Make game states.
		this.statePlaceShips = 1;
		this.stateChooseTarget = 2;
		this.stateEnemyChooseTarget = 3;
		this.stateWin = 4;
		this.stateLose = 5;
		this.state = this.statePlaceShips;
		
		// Make ship types.
		this.shipPlacing = null;
		this.shipType2 = new ShipType("GunBoat", "ship2.png", 2);
		this.shipType3 = new ShipType("Destroyer", "ship3.png", 3);
		this.shipType4 = new ShipType("Cruiser", "ship4.png", 4);

		window.onload = this.setup.bind(this);
	}
	
	setup() {

		// Setup input events.
		window.onresize = this.resize.bind(this);

		window.addEventListener("mousemove", (ev) => {
			this.setMousePosition(ev.clientX, ev.clientY);
		});
		document.addEventListener("touchmove", (ev) => {
			const touch = ev.changedTouches[0];
			this.setMousePosition(touch.clientX, touch.clientY);
			ev.preventDefault();
			return false;
		}, { passive: false });

		window.addEventListener("mouseup", this.mouseUp.bind(this));
		document.addEventListener("touchend", (ev) => {
			const touch = ev.changedTouches[0];
			this.setMousePosition(touch.clientX, touch.clientY);
			this.mouseUp();
		});
		
		document.addEventListener("touchstart", (ev) => {
			const touch = ev.changedTouches[0];
			this.setMousePosition(touch.clientX, touch.clientY);
			ev.preventDefault();
			return false;
		}, { passive: false });
		
		// Make players.
		this.you = new Player("You");
		this.players.push(this.you);
		
		this.enemy = new Player("Opponent");
		this.players.push(this.enemy);
		this.enemy.boardX += (gridLength + 1) * tileSize;
		
		this.you.otherPlayer = this.enemy;
		this.enemy.otherPlayer = this.you;
		
		// Each player gets 2 ships of each type.
		for(let player of this.players) {
			player.makeShip(this.shipType4);
			player.makeShip(this.shipType4);
			player.makeShip(this.shipType3);
			player.makeShip(this.shipType3);
			player.makeShip(this.shipType2);
			player.makeShip(this.shipType2);
		}
		
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
		// Make the canvas as large as we can in the current screen size.
		if(window.innerWidth / window.innerHeight > canvasSizeRatio) {
			this.canvas.style.width = window.innerHeight * canvasSizeRatio + 'px';
			this.canvas.style.height = "100%";
			this.canvasPixelSize = window.innerHeight / canvasHeight;
		} else {
			this.canvas.style.width = "100%";
			this.canvas.style.height = window.innerWidth / canvasSizeRatio + 'px';
			this.canvasPixelSize = window.innerWidth / canvasWidth;
		}
		
		window.scrollTo(0, 0);
	}
	
	setMousePosition(x, y) {
		// Convert screen pixels to game canvas pixels.
		x -= mainCanvas.offsetLeft;
		x /= this.canvasPixelSize;
		y /= this.canvasPixelSize;
		
		// Move mouse to switch the direction of the ship you're placing.
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
	
	mouseUp() {
		if(this.shipPlacing) {
			// Click to place a ship.
			this.shipPlacing.place();
			this.shipPlacing = null;
			
			// Start placing the next ship.
			for(let ship of this.you.ships) {
				if(!ship.inGrid) {
					this.shipPlacing = ship;
					ship.placing = true;
					break;
				}
			}
			
			// You placed all your ships.
			if(!this.shipPlacing) {
				this.enemy.AIPlaceShips();
				this.state = this.stateChooseTarget;
			}
			
		} else if(this.state === this.stateChooseTarget) {
			
			// Choose target to shoot.
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
			height = this.shipPlacing.type.size;
		} else {
			width = this.shipPlacing.type.size;
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
			// The enemy moves the target to its destination, not too fast.
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
		this.context.clearRect(0, 0, canvasWidth, canvasHeight);
		
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
		
		// Draw grid background (water)
		for(let y = 0; y < gridLength; y++) {
			for(let x = 0; x < gridLength; x++) {
				this.context.drawImage(this.waterImage, x * tileSize, y * tileSize);
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
				if(ship.player === this.you || ship.health <= 0) {
					ship.draw(this.context);
				}
			}
		}
		
		// Draw grid foreground (missile craters)
		for(let y = 0; y < gridLength; y++) {
			for(let x = 0; x < gridLength; x++) {
				let tile = player.grid[x][y];
				if(tile.hit) {
					if(tile.ship === null) {
						this.context.drawImage(this.missImage, x * tileSize, y * tileSize);
					} else {
						if(tile.ship.health <= 0) {
							this.context.drawImage(this.hitImage, x * tileSize, y * tileSize);
						} else {
							// Animate the ships that are on fire.
							let size = tileSize * (1 + Math.sin(Date.now() / 80) * .1);
							let sizeChange =  (tileSize - size) / 2;
							this.context.drawImage(this.hitImage, x * tileSize + sizeChange, y * tileSize + sizeChange, size, size);
						}
					}
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

// Images are 25x25 pixel art. The canvas scales up to fit the screen.
const tileSize = 25;
// Each player has an 8x8 grid.
const gridLength = 8;
// Canvas is wide enough for 2 grids plus margin.
const canvasWidth = tileSize * ((gridLength + 1) * 2 + 1);
const canvasHeight = tileSize * (gridLength + 3);
const canvasSizeRatio = canvasWidth / canvasHeight;

const randomInt = (low, high) => {
	return Math.floor(Math.random() * (high - low + 1) + low);
}


new Game();
