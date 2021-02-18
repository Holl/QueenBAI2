var common = require('commonFunctions');
var db = require('debugTools');

module.exports = function(queenName, queenObj, empressOrder){
	for(var bee in queenObj['bees']['tank']){
        var beeName = queenObj['bees']['tank'][bee];
        var beeObj = Game.creeps[beeName];
        beeObj.moveTo(new RoomPosition(25, 25, beeObj.memory.targetRoom));
	}
	for(var bee in queenObj['bees']['swarm']){
        var beeName = queenObj['bees']['swarm'][bee];
        var beeObj = Game.creeps[beeName];
        beeObj.moveTo(new RoomPosition(32, 40, beeObj.memory.targetRoom));
	}
}