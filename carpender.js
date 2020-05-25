module.exports = function(queenName, queenObject){

	levelUpConstruction(queenName, queenObject);

	if (true){
		var roomName = 'E37N22'
		buildRoom(queenName);
	}
}

// This is the functionality that adds contruction projects
// once we level up.
function levelUpConstruction(queenName, queenObject){

	if (queenObject['levelUpBool']){
		var thisRoom = Game.rooms[queenName];
		var spawnPos =  thisRoom.find(FIND_MY_SPAWNS)[0].pos;
		var spawnX = spawnPos.x;
		var spawnY = spawnPos.y;
		switch (queenObject['level']){
			case 1:
				console.log("This shouldn't ever happen.");
				break;
			case 2:
				createDiamond(thisRoom, spawnPos.x, spawnPos.y-1);
				break;
			case 3:
				thisRoom.getPositionAt(spawnPos.x-2, spawnPos.y-2).createConstructionSite(STRUCTURE_TOWER);
				createDiamond(thisRoom, spawnPos.x, spawnPos.y+5);
				roadsToRoam(thisRoom, spawnPos);

				break;
			case 4:
				thisRoom.getPositionAt(spawnPos.x+2, spawnPos.y-2).createConstructionSite(STRUCTURE_STORAGE);
				createDiamond(thisRoom, spawnPos.x-3, spawnPos.y+2);
				createDiamond(thisRoom, spawnPos.x+3, spawnPos.y+2);
				break;
		}
	}
}

function buildRoom(roomName){
	console.log("This");
	var room = Game.rooms[roomName];
	var terrain = room.getTerrain();
	var sources = room.find(FIND_SOURCES);
	var controller = room.controller;
	var printString = '        ';
	console.log(sources);

	for (var y=0; y<50; y++){
		for (var x=0; x<50; x++){
			if (x == sources[0].pos.x && y == sources[0].pos.y){
				printString += '  S';
			}
			else if (sources[1] && x == sources[1].pos.x && y == sources[1].pos.y){
				printString += '  S';
			}
			else if (x == controller.pos.x && y == controller.pos.y){
				printString += '  C';
			}
			else{
				var point = terrain.get(x,y);
				switch(point) {
				    case TERRAIN_MASK_WALL:
				        printString += '   ';
				        break;
				    case TERRAIN_MASK_SWAMP:
				    case 0:
				    	if (y == 0 || x == 0 || y == 49 || x == 49){
				    		printString += '  E'
				    	}
				    	else{
				    		printString += '  O'
				    	}
				        break;
				}
			}
		}
		printString +='\n\t'
	}

	console.log(printString);
}

function roadsToRoam(room, spawnPos){
	var spawnX = spawnPos.x;
	var spawnY = spawnPos.y;

	var startX = 0;
	var startY = 0;

	var sources = room.find(FIND_SOURCES);

	for (var source in sources){
		var sourcePos = sources[source].pos;
		if (sourcePos.y<=spawnY){
			startY = spawnY-3;
		}
		else{
			startY = spawnY+3;
		}
		if (sourcePos.x<=spawnX){
			startX = spawnX - 2;
		}
		else{
			startX = spawnX + 2;
		}
		buildRoad(room, startX, startY, sourcePos.x, sourcePos.y);
	}
	var controllerPos = room.controller.pos;
	if (controllerPos.y<=spawnY){
		startY = spawnY-3;
	}
	else{
		startY = spawnY+3;
	}
	if (controllerPos.x<=spawnX){
		startX = spawnX - 2;
	}
	else{
		startX = spawnX + 2;
	}
	buildRoad(room, startX, startY, controllerPos.x, controllerPos.y);
}

function buildRoad(room, startX, startY, endX, endY){
	var route = room.getPositionAt(startX,startY).findPathTo(endX,endY);
	for (var point in route){
		if (point !== route.length-1){
			room.getPositionAt(route[point].x,route[point].y).createConstructionSite(STRUCTURE_ROAD);
		}
	}
}

// Converting the insane object into something more manageable,
// an array of arrays.  50 points in each of the 50 arrays.

function createDiamond(room, x, y){
	room.createConstructionSite(x,y-1,STRUCTURE_EXTENSION);
	room.createConstructionSite(x,y-2,STRUCTURE_EXTENSION);
	room.createConstructionSite(x+1,y-2,STRUCTURE_EXTENSION);
	room.createConstructionSite(x-1,y-2,STRUCTURE_EXTENSION);
	room.createConstructionSite(x,y-3,STRUCTURE_EXTENSION);
	room.createConstructionSite(x,y,STRUCTURE_ROAD);
	room.createConstructionSite(x-1,y-1,STRUCTURE_ROAD);
	room.createConstructionSite(x+1,y-1,STRUCTURE_ROAD);
	room.createConstructionSite(x+2,y-2,STRUCTURE_ROAD);
	room.createConstructionSite(x-2,y-2,STRUCTURE_ROAD);
	room.createConstructionSite(x+1,y-3,STRUCTURE_ROAD);
	room.createConstructionSite(x-1,y-3,STRUCTURE_ROAD);
	room.createConstructionSite(x,y-4,STRUCTURE_ROAD);
}