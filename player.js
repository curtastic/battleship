"use strict";

class Player {
	constructor(name) {
		this.name = name;
		this.ships = [];
		this.otherPlayer = null;
		
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
		
		// Where they're going to shoot.
		this.targetX = 0;
		this.targetY = 0;
		this.targetDestX = 0;
		this.targetDestY = 0;
	}
	
	makeShip(type) {
		new Ship(this, type);
	}
	
	AIPlaceShips() {
		for(let ship of this.ships) {
			// Find a random spot that the ship can be.
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
		//Choose a random spot to shoot.
		let found = false;
		while(!found) {
			this.targetX = randomInt(0, gridLength - 1);
			this.targetY = randomInt(0, gridLength - 1);
			if(this.canTarget())
			{
				found = true;
			}
		}
		
		// Make the crosshair go from the center of the grid to this target.
		this.targetDestX = this.targetX;
		this.targetDestY = this.targetY;
		this.targetX = this.targetY = Math.floor(gridLength / 2);
	}
	
	canTarget() {
		let ship = this.otherPlayer.grid[this.targetX][this.targetY];
		
		if(ship instanceof Ship) {
			// If there's a ship here, you can target it if it's not already sunk.
			return !ship.sunk;
		} else {
			// If there's no ship here, you can target it if you haven't already shot here.
			return (ship === 0);
		}
	}
	
	takeHit(x, y) {
		let ship = this.grid[x][y];
		
		if(ship instanceof Ship) {
			// If there's a ship here, sink it.
			ship.sunk = true;
		} else {
			// Otherwise mark it as already shot here.
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