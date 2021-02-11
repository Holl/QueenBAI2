var db = require('debugTools');

module.exports = function(queenName, queenObject){

	levelUpConstruction(queenName, queenObject);

	if (false){ 
		// We need to run this when we need to place
		// a new spawn.  Not really sure which AI sets it off...
		findCenterSpawnLocation(queenName);
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

function findCenterSpawnLocation(roomName){

	// This is the logic to find our central spawn 
	// location that will build our diamond base.

	// Start by grabbing all the data we'll need...

	var room = Game.rooms[roomName];
	var terrain = room.getTerrain();
	var sources = room.find(FIND_SOURCES);
	var controller = room.controller;
	var possiblePos = [];

	// The first bit of math is easy, we're just looking for the
	// average X/Y coords of the sources and the controller,
	// as this will be useful in determining where our base SHOULD be.
	// We'll compare this to where it CAN be later.

	var totalX = 0;
	var totalY = 0;

	for (var x = 0; x < sources.length; x++){
		totalX+=sources[x].pos.x;
		totalY+=sources[x].pos.y;
	}

	totalX+=controller.pos.x;
	totalY+=controller.pos.y;

	var avgX = totalX/(sources.length + 1);
	var avgY = totalY/(sources.length + 1);

	// Now we begin our crazy expensive process of looking at every
	// point.

	// We start at 8 and go to 41 because we know the edges
	// won't work.  The base would go over the edges!

	// This functionality can be HEAVILY improved in effectiveness
	// by starting from the pythagorasCheck'd point and working out,
	// rather than every position on the map.  Still it's not terribly
	// expensive, given how infrequently this needs to run, so...
	// meh.

	for (var y=8; y<41; y++){ 

		// Count is useful to know if we have a clear row of 11 to build.
		var count = 0;

		for (var x=8; x<41; x++){
			var point = terrain.get(x,y);
			if (point == 0 || point == 2){
				// Clear or swamp.
				count++;
			}
			else{
				// Wall, so we reset!
				count=0;
			}
			if (count>10){
				// We've hit a good row, and can check if the surrounding area
				// is OK.
				var baseCheckBool = checkWallsAroundSpawn(x,y,terrain);
				if (baseCheckBool == true){
					// If this returns true, we know it's a suitable location.
					// We'll push it to the possible array.
					db.vLog("Base can start at (" + x +"," + y + ")");
					possiblePos.push({"x":x,"y":y});
				}
			}
		}
	}

	db.vLog("The average X is " + avgX);
	db.vLog("The average Y is " +avgY);

	var finalPos = pythagorasCheck(avgX,avgY,possiblePos);

	console.log("Carpenter thinks we should build the starting spawn at (" + finalPos.x + "," + finalPos.y + ")");

}

function pythagorasCheck(avgX,avgY,positionArray){
	// Middle school math saves the day again.
	// We essentially need to calculate the closest possible point to 
	// the average X/Y of sources and controller determined in the main loop.
	var minDistance = 99999999;
	var closestPoint;
	var distance = 0;
	for (var a = 0; a < positionArray.length; a++) {
		distance = Math.sqrt((avgX - positionArray[a].x) * (avgX - positionArray[a].x) + (avgY - positionArray[a].y) * (avgY - positionArray[a].y));
		if (distance < minDistance) {
			minDistance = distance;
			closestPoint = positionArray[a];
		}
	}

	return closestPoint;
}

function checkWallsAroundSpawn(x,y,terrain){

	// This check has the wierdest logic, but it requires it so far as we can tell.

	// This is the array of how many X points across each level of the base shape
	// take up.  This mean, at the moment, this check could only work for
	// a symetrical base shape.
	// It's a diamond, so we start small, then go big, then back small.
	var shapeArray = [1,3,5,7,9,11,9,7,5,3,1];

	// Loop goes to 11 because that's the height.

	for (var checkY=0; checkY<11; checkY++){
		// The # in the shape array is the amount across but we need to go
		// left over to that, as the center point isn't where we start.
		// IE in the 2nd row, it may be 3 across, but it's 1 on a side,
		// so we should start our X one to the left.  The -1 just removes
		// the centerpoint.

		var leftMostX = 0-((shapeArray[checkY]-1)/2);

		// This loop is weird for sure but it makes sense.
		// Our outer loop goes the height of the shape,
		// but this inner loop only needs to run the width of the shape
		// determined by the point in the array, starting at the leftMostX.
		// That's why the loops inequality is so weird.

		for (var checkX=leftMostX; checkX<shapeArray[checkY]+leftMostX; checkX++){
			var newX = x + checkX;
			var newY = y + (checkY - 5);
			if (terrain.get(newX, newY) == 1){
				// As soon as we find a problem, we can leave.
				db.vLog(x + "," + y + " doesn't work because of " + newX + "," +newY + ".  We started this row's count at " + leftMostX + " and we counted " + shapeArray[checkY] + " times.");
				return false;
			}
		}
	}
	// If we've never run into a problem, we're OK!
	return true;
}


function buildRoom(roomName){
	var room = Game.rooms[roomName];
	var terrain = room.getTerrain();
	var sources = room.find(FIND_SOURCES);
	var controller = room.controller;
	var printString = '        ';
	console.log(terrain);

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
	route.pop();
	for (var point in route){
		room.getPositionAt(route[point].x,route[point].y).createConstructionSite(STRUCTURE_ROAD);
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