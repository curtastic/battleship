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
				this.grid[x][y] = new Tile();
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
	
	// Check if there's any ship they've hit so they should try to hit the rest of it to sink it.
	AIChooseGoodTarget() {
		for(let x = 0; x < gridLength; x++) {
			for(let y = 0; y < gridLength; y++) {
				let tile = this.otherPlayer.grid[x][y];
				
				// Find a ship that is hit but not sunk.
				if(tile.hit && tile.ship !== null && tile.ship.health > 0 && tile.ship.health < tile.ship.type.size) {
					this.targetX = x;
					this.targetY = y;
					
					// Shoot a random nearby tile in hopes that it hits the rest of the ship.
					let direction = randomInt(0, 3);
					if(direction === 0) {
						this.targetX++;
					} else if(direction === 1) {
						this.targetY++;
					} else if(direction === 2) {
						this.targetX--;
					} else if(direction === 3) {
						this.targetY--;
					}
					if(this.canTarget())
					{
						return true;
					}
				}
			}
		}
		return false;
	}
	
	AIChooseTarget() {
		let found = this.AIChooseGoodTarget();
		
		// No good targets, choose a random spot to shoot.
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
		if(!this.inGridBounds(this.targetX, this.targetY)) {
			return false;
		}
		const tile = this.otherPlayer.grid[this.targetX][this.targetY];
		return !tile.hit;
	}
	
	takeHit(x, y) {
		const tile = this.grid[x][y];
		
		// Mark this tile as hit.
		tile.hit = true;
		
		// If there's a ship here, it takes damage.
		if(tile.ship !== null) {
			tile.ship.health--;
		}
	}
	
	checkIfLost() {
		for(let ship of this.ships) {
			if(ship.health > 0) {
				return false;
			}
		}
		return true;
	}
	
	inGridBounds(x, y) {
		return x >= 0 && y >= 0 && x < gridLength && y < gridLength;
	}
}


class Tile {
	constructor() {
		this.hit = false;
		this.ship = null;
	}
}