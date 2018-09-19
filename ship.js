"use strict";

class Ship {
	constructor(player, type) {
		this.player = player;
		player.ships.push(this);
		
		this.type = type;
		this.x = 0;
		this.y = 0;
		this.inGrid = false;
		this.vertical = false;
		this.sunk = false;
	}
	
	canPlace() {
		let x = this.x;
		let y = this.y;
		
		for(let add = 0; add < this.type.length; add++) {
			if(!inGridBounds(x, y)) {
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
	}
	
	draw() {
		game.context.save();
		if(this === game.shipPlacing) {
			game.context.globalAlpha = Math.sin(Date.now() / 80) * .3 + .5;
		}
		
		game.context.translate((this.x+ .5) * tileSize, (this.y + .5) * tileSize);
		if(this.vertical) {
			game.context.rotate(Math.PI / 2);
		}
		
		game.context.drawImage(this.type.image, -tileSize / 2, -tileSize / 2);
		
		if(this === game.shipPlacing) {
			if(!this.canPlace()) {
				game.context.globalAlpha = .3;
				game.context.fillStyle = '#C00';
				game.context.fillRect(-tileSize / 2, -tileSize / 2, this.type.length * tileSize, tileSize);
			}
			game.context.globalAlpha = 1;
		}
		
		if(this.sunk) {
			game.context.globalAlpha = .5;
			game.context.fillStyle = '#C00';
			game.context.fillRect(-tileSize / 2, -tileSize / 2, this.type.length * tileSize, tileSize);
		}
		
		game.context.restore();
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
