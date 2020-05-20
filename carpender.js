module.exports = function(queenName, queenObject){

	levelUpConstruction(queenName, queenObject);

	if (false){
		var roomTerrainObject = exampleJSONRoom;
		var roomName = 'E5N22'
		var roomObj = Game.rooms[roomName];
		var room = convertToArray(roomTerrainObject, roomObj);
		buildRoomMap(room);
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
	buildRoad(room, startX, startY, sourcePos.x, sourcePos.y);
}

function buildRoad(room, startX, startY, endX, endY){
	var route = room.getPositionAt(startX,startY).findPathTo(endX,endY);
	for (var point in route){
		if (!point== route.length){
			room.getPositionAt(route[point].x,route[point].y).createConstructionSite(STRUCTURE_ROAD);
		}
	}
}

// Converting the insane object into something more manageable,
// an array of arrays.  50 points in each of the 50 arrays.
function convertToArray(roomTerrainObject, roomObj){
	var finalArray = [];
	var rowArray = [];
	var count = 0;
	for (var point in roomTerrainObject){
		rowArray.push(roomTerrainObject[point]);
		if (count == 49){
			finalArray.push(rowArray);
			rowArray = [];
			count = 0;
		}
		else{
			count++;
		}
	}

	var sources = roomObj.find(FIND_SOURCES);
	var avgCount = 1;
	var centerX = 0;
	var centerY = 0;
	for (var source in sources){
		finalArray[sources[source].pos.y][sources[source].pos.x] = "S";
		centerY+= sources[source].pos.y;
		centerX+= sources[source].pos.x;
		avgCount++;
	}
	var controller = roomObj.controller;
	finalArray[roomObj.controller.pos.y][roomObj.controller.pos.x] = "C";

	centerY+= roomObj.controller.pos.y;
	centerX+= roomObj.controller.pos.x;
	centerY=centerY/avgCount;
	centerX=centerX/avgCount;

	finalArray[Math.floor(centerY)][Math.floor(centerX)] = "X";

	return finalArray;

}

// Put together a printable map to the console log.
function buildRoomMap(roomArray){
 	var count = 0;
 	var finalString = '        ';

 	for (var i = 0; i<roomArray.length; i++){

    	for (var y = 0; y<roomArray[i].length; y++){
    		var point = roomArray[i][y];
    		if(point == 0 || point == 2){
    			finalString+= '  ';
    		}
    		else if(point == 1){
	    		finalString+= 'W ';
	    	}
	    	else if(point == "S"){
	    		finalString+= 'S ';
	    	}
	    	else if (point == "C"){
	    		finalString += 'C '
	    	}
	    	else if (point == "X"){
	    		finalString += 'X '
	    	}
    	}
    	finalString+='\n\t';
    };

    console.log(finalString);
}

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