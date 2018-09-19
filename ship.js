"use strict";

class Ship {
	constructor(player, type) {
		this.player = player;
		player.ships.push(this);
		
		this.type = type;
		this.x = 0;
		this.y = 0;
		this.inGrid = false;
	}
	
	canPlace() {
		for(let add = 0; add < this.type.length; add++) {
			if(!this.player.inGridBounds(this.x + add, this.y)) {
				return false;
			}
			if(this.player.grid[this.x + add][this.y]) {
				return false;
			}
		}
		return true;
	}
	
	place() {
		let x = this.x;
		let y = this.y;
		
		if(!this.canPlace()) {
			return false;
		}
		
		for(let add = 0; add < this.type.length; add++) {
			this.player.grid[this.x + add][this.y] = this;
		}
		
		this.inGrid = true;
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
