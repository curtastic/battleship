"use strict";

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
		for(let x = 0; x < gridLength; x++) {
			this.grid[x] = [];
			for(let y = 0; y < gridLength; y++) {
				this.grid[x][y] = null;
			}
		}
		
		// Create the player's ships.
		this.ships = [];
		new Ship(this, shipType4);
		new Ship(this, shipType4);
		new Ship(this, shipType3);
		new Ship(this, shipType3);
		new Ship(this, shipType2);
		new Ship(this, shipType2);
		
		game.players.push(this);
	}
	
	AIPlaceShips() {
		for(let ship of this.ships) {
			while(!ship.inGrid) {
				ship.x = randomInt(0, gridLength - 1);
				ship.y = randomInt(0, gridLength - 1);
				ship.vertical = (randomInt(0, 1) == 1);
				if(ship.canPlace()) {
					ship.place();
				}
			}
		}
	}
	
}