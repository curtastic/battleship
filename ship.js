"use strict";

class Ship {
	constructor(player, type) {
		this.player = player;
		player.ships.push(this);
		
		this.type = type;
		this.x = 0;
		this.y = 0;
		this.placing = false;
		this.inGrid = false;
		this.vertical = false;
		this.sunk = false;
	}
	
	canPlace() {
		let x = this.x;
		let y = this.y;
		
		for(let add = 0; add < this.type.length; add++) {
			if(!this.player.inGridBounds(x, y)) {
				return false;
			}
			
			if(this.player.grid[x][y]) {
				return false;
			}
			
			if(this.vertical) {
				y++;
			} else {
				x++;
			}
		}
		return true;
	}
	
	place() {
		if(!this.canPlace()) {
			return false;
		}
		
		let x = this.x;
		let y = this.y;
		
		for(let add = 0; add < this.type.length; add++) {
			this.player.grid[x][y] = this;
			if(this.vertical) {
				y++;
			} else {
				x++;
			}
		}
		
		this.inGrid = true;
		this.placing = false;
	}
	
	draw(context) {
		context.save();
		
		// Make the ship you're placing blink.
		if(this.placing) {
			context.globalAlpha = Math.sin(Date.now() / 80) * .3 + .5;
		}
		
		// Rotate ships that are vertical.
		context.translate((this.x+ .5) * tileSize, (this.y + .5) * tileSize);
		if(this.vertical) {
			context.rotate(Math.PI / 2);
		}
		
		// Draw the ship image.
		context.drawImage(this.type.image, -tileSize / 2, -tileSize / 2);
		
		// Show if you can place the ship here.
		if(this.placing) {
			if(!this.canPlace()) {
				context.globalAlpha = .3;
				context.fillStyle = '#C00';
				context.fillRect(-tileSize / 2, -tileSize / 2, this.type.length * tileSize, tileSize);
			}
			context.globalAlpha = 1;
		}
		
		// Show sunken ships as red.
		if(this.sunk) {
			context.globalAlpha = .5;
			context.fillStyle = '#C00';
			context.fillRect(-tileSize / 2, -tileSize / 2, this.type.length * tileSize, tileSize);
		}
		
		context.restore();
	}
}

class ShipType {
	constructor(name, filename, length) {
		this.name = name;
		
		this.image = new Image();
		this.image.src = "images/" + filename;
		
		this.length = length;
	}
}
