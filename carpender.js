module.exports = function(queenName, queenObject){
	// var roomTerrainObject = exampleJSONRoom;
	// var roomName = 'E5N22'
	// var roomObj = Game.rooms[roomName];
	levelUpConstruction(queenName, queenObject);
	// var room = convertToArray(roomTerrainObject, roomObj);
 //    buildRoomMap(room);
}

function levelUpConstruction(queenName, queenObject){
	if (queenObject['levelUpBool']){
		console.log("Confirming level up to " + queenObject['level'] + ".");
		switch (queenObject['level']){
			case 1:
				console.log("This shouldn't ever happen.");
			case 2:
				console.log("We should ")
		}
	}
}

function convertToArray(roomTerrainObject, roomObj){
	// Converting the insane object into something more manageable,
	// an array of arrays.  50 points in each of the 50 arrays.
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

function checkIfConstructionNeeded(){
	
}