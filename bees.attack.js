var common = require('commonFunctions');
var db = require('debugTools');

module.exports = function(queenName, queenObj, empressOrder){
	for(var bee in queenObj['bees']['tank']){
        var beeName = queenObj['bees']['tank'][bee];
        var beeObj = Game.creeps[beeName];
        if (beeObj.room.name != queenName && beeObj.room.name != beeObj.memory.targetRoom){
        	beeObj.memory.healRoom = beeObj.room.name;
        }
        if(beeObj.room.name != beeObj.memory.targetRoom && beeObj.hits == beeObj.hitsMax){
            beeObj.memory.injury = 0;
        }
        if (beeObj.hits < 1500){
        	beeObj.memory.injury = 1;
        	beeObj.moveTo(new RoomPosition(32, 47, beeObj.memory.healRoom));
        }
        if (!beeObj.memory.injury && beeObj.room.name != beeObj.memory.targetRoom){
        	beeObj.moveTo(new RoomPosition(32, 1, beeObj.memory.targetRoom));
        }
        else if (beeObj.memory.injury) {
        	beeObj.moveTo(new RoomPosition(32, 47, beeObj.memory.healRoom));
        }
        else{
        	beeObj.moveTo(new RoomPosition(32, 1, beeObj.memory.targetRoom));
        	beeObj.say("Ouch!");
        }
	}
	for(var bee in queenObj['bees']['swarm']){
        var beeName = queenObj['bees']['swarm'][bee];
        var beeObj = Game.creeps[beeName];
        if(beeObj.room.name != beeObj.memory.targetRoom){
            beeObj.moveTo(new RoomPosition(25, 25, beeObj.memory.targetRoom));
        }
        else{
        	var tower = Game.rooms[beeObj.memory.targetRoom].find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}})[0];
        	var closeHostile = beeObj.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        	var spawn = Game.rooms[beeObj.memory.targetRoom].find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}})[0];
        	if (closeHostile && closeHostile.owner.username != "staxwell"){
        		if(beeObj.attack(closeHostile) == ERR_NOT_IN_RANGE) {
        			beeObj.moveTo(closeHostile);
	        	}
	        	else{
	        		beeObj.attack(closeHostile); 
	        	}
	        }
        	else if (tower){
        		if(beeObj.attack(tower) == ERR_NOT_IN_RANGE) {
        			beeObj.moveTo(tower.pos);
	        	}
	        	else{
	        		beeObj.attack(tower); 
	        	}
	        }
			else if (spawn){
        		if(beeObj.attack(spawn) == ERR_NOT_IN_RANGE) {
        			beeObj.moveTo(spawn.pos);
	        	}
	        	else{
	        		beeObj.attack(spawn); 
	        	}
	        }
	        else{
	        	beeObj.moveTo(new RoomPosition(25, 25, beeObj.memory.targetRoom));
	        }
        }
	}
	for (var bee in queenObj['bees']['healer']){
        var beeName = queenObj['bees']['healer'][bee];
        var beeObj = Game.creeps[beeName];
        beeObj.moveTo(new RoomPosition(32, 46, beeObj.memory.healRoom));
		if(beeObj.room.name != beeObj.memory.healRoom){
            beeObj.moveTo(new RoomPosition(25, 25, beeObj.memory.healRoom));
        }
        else if (beeObj.memory.healTarget){
        	var target = Game.getObjectById(beeObj.memory.healTarget)
        	if (target){
				if (target.hits == target.hitsMax){
					console.log("MAX!")
	        		beeObj.memory.healTarget = null;
	        	}
				else if(beeObj.heal(target) == ERR_NOT_IN_RANGE) {
	    			beeObj.moveTo(target.pos);
	        	}
        	}
        	else {
        		beeObj.memory.healTarget = null;
        	}
        }
        else{
        	var hurtBees = beeObj.room.find(FIND_MY_CREEPS);
        	for (hurtBee in hurtBees){
        		if (hurtBees[hurtBee].hits < hurtBees[hurtBee].hitsMax){
	        		beeObj.memory.healTarget = hurtBees[hurtBee].id;
        		}
        	}
        	if (!beeObj.memory.healTarget){
        		beeObj.moveTo(new RoomPosition(32, 46, beeObj.memory.healRoom));
        	}
        }
	}
}