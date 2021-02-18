var common = require('commonFunctions');
var db = require('debugTools');

module.exports = function(queenName, queenObj, empressOrder){
	for(var bee in queenObj['bees']['defender']){
        var beeName = queenObj['bees']['defender'][bee];
        var beeObj = Game.creeps[beeName];
        if(beeObj.room.name != beeObj.memory.targetRoom){
            beeObj.moveTo(new RoomPosition(25, 25, beeObj.memory.targetRoom));
        }
        else{
        	var closeHostile = beeObj.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        	if (closeHostile){
        		console.log(closeHostile.owner.username)
        		if(beeObj.rangedAttack(closeHostile) == ERR_NOT_IN_RANGE) {
        			beeObj.moveTo(closeHostile);
	        	}
	        	else{
	        		beeObj.rangedAttack(closeHostile); 
	        	}
	        }
	        else{
	        	beeObj.moveTo(new RoomPosition(25, 25, beeObj.memory.targetRoom));
	        }
	    }
	}
}

