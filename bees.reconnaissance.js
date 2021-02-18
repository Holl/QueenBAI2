var common = require('commonFunctions');
var db = require('debugTools');

module.exports = function(queenName, queenObj){
	for (var beeIndex in queenObj['bees']['scout']){
		var ourBee = Game.creeps[queenObj['bees']['scout'][beeIndex]];
		var currentRoomName = ourBee.room.name;
		if (ourBee.memory.targetRoom){
			if (ourBee.memory.targetRoom == currentRoomName){
				var spawnLoc = common.findCenterSpawnLocation(currentRoomName);
				var room = Game.rooms[currentRoomName];
				var sources = room.find(FIND_SOURCES);
				var controller = room.controller;
				var deposits = room.find(FIND_DEPOSITS);
				var owner='';
				if(controller){
					if (controller.owner){
						owner = controller.owner.username;
					}
					else{
						owner=false;
					}
				}
				else{
					owner=null; 
				}
				
				if (spawnLoc == false){
					Memory.empress.scoutReports[currentRoomName] = {
						"capturable":false,
						"sources": sources,
						"controller": controller,
						"owner":owner,
						"deposits":deposits
					}
				}
				else{
					Memory.empress.scoutReports[currentRoomName] = {
						"capturable":true,
						"spawnLocation": spawnLoc,
						"sources": sources,
						"controller": controller,
						"owner":owner,
						"deposits":deposits
					}
				}
				ourBee.memory.targetRoom = '';
				ourBee.suicide();
			}
			else {
				ourBee.moveTo(new RoomPosition(25,25,ourBee.memory.targetRoom));
			}
		}
		else if (currentRoomName == queenName){
			var exits = Game.map.describeExits(queenName);
			var scoutMemory = Memory.empress.scoutReports;
			if (!scoutMemory){
				ourBee.memory.targetRoom = exits[1];
			}
			else if (!scoutMemory[exits[1]]){
				ourBee.memory.targetRoom = exits[1];
			}
			else if(!scoutMemory[exits[3]]){
				ourBee.memory.targetRoom = exits[3];
			}
			else if(!scoutMemory[exits[5]]){
				ourBee.memory.targetRoom = exits[5];
			}
			else if(!scoutMemory[exits[7]]){
				ourBee.memory.targetRoom = exits[7];
			}
			else{
				ourBee.suicide();
			}

			ourBee.moveTo(25,25,ourBee.memory.targetRoom, {});
		}
		else if (false){
			// db.vLog("uhh")
		}
	}
}