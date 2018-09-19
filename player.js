"use strict";

class Player {
	constructor(name) {
		this.name = name;
		
		// Set the player's board position.
		this.boardX = tileSize;
		this.boardY = tileSize * 2;
		
		// Create the player's grid.
		this.grid = [];
		for(let x = 0; x < gridLength; x++) {
			this.grid[x] = [];
			for(let y = 0; y < gridLength; y++) {
				this.grid[x][y] = 0;
			}
		}
		
		// Create the player's ships.
		this.ships = [];
		new Ship(this, game.shipType4);
		new Ship(this, game.shipType4);
		new Ship(this, game.shipType3);
		new Ship(this, game.shipType3);
		new Ship(this, game.shipType2);
		new Ship(this, game.shipType2);
		
		// Where they're going to shoot.
		this.targetX = 0;
		this.targetY = 0;
		this.targetDestX = 0;
		this.targetDestY = 0;
		
		this.otherPlayer = null;
	}
	
	AIPlaceShips() {
		for(let ship of this.ships) {
			while(!ship.inGrid) {
				ship.x = randomInt(0, gridLength - 1);
				ship.y = randomInt(0, gridLength - 1);
				ship.vertical = (randomInt(0, 1) === 1);
				if(ship.canPlace()) {
					ship.place();
				}
			}
		}
	}
	
	AIChooseTarget() {
		let found = false;
		while(!found) {
			this.targetX = randomInt(0, gridLength - 1);
			this.targetY = randomInt(0, gridLength - 1);
			if(this.canTarget())
			{
				found = true;
			}
		}
		this.targetDestX = this.targetX;
		this.targetDestY = this.targetY;
		this.targetX = this.targetY = Math.floor(gridLength / 2);
	}
	
	canTarget() {
		let ship = this.otherPlayer.grid[this.targetX][this.targetY];
		if(ship instanceof Ship) {
			return !ship.sunk;
		} else {
			return (ship !== 1);
		}
	}
	
	takeHit(x, y) {
		let ship = this.grid[x][y];
		if(ship instanceof Ship) {
			ship.sunk = true;
		} else {
			this.grid[x][y] = 1;
		}
	}
	
	checkIfLost() {
		for(let ship of this.ships) {
			if(!ship.sunk) {
				return false;
			}
		}
		return true;
	}
	
	inGridBounds(x, y) {
		return x >= 0 && y >= 0 && x < gridLength && y < gridLength;
	}
}