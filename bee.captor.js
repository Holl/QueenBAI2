var common = require('commonFunctions');

module.exports = function captureFunciton(queenName, queenObj, empressOrders){
    for(var bee in queenObj['bees']['captor']){
        var beeName = queenObj['bees']['captor'][bee];
        var bee = Game.creeps[beeName];
        if(bee.room.name != bee.memory.targetRoom){
            bee.moveTo(new RoomPosition(25, 25, bee.memory.targetRoom));
        }
        else{
            if(bee.room.controller) {
                if(bee.claimController(bee.room.controller) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(bee.room.controller);
                }
                else if(bee.claimController(bee.room.controller) == ERR_INVALID_TARGET){
                    var spawns = bee.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_SPAWN)
                        }
                    });
                    var constructions = bee.room.find(FIND_CONSTRUCTION_SITES);
                    if (spawns.length == 0 && constructions.length == 0){
                        console.log("Let's set it up.");
                        var spawnLoc = common.findCenterSpawnLocation(bee.room.name);
                        bee.room.createConstructionSite(spawnLoc.x,spawnLoc.y,STRUCTURE_SPAWN)
                    }
                    else{
                        // Nothing at the moment.
                    }
                }
            }
        }
    }
    for(var bee in queenObj['bees']['captorBuilder']){
        var beeName = queenObj['bees']['captorBuilder'][bee];
        var bee = Game.creeps[beeName];
        if(bee.room.name != bee.memory.targetRoom){
            bee.moveTo(new RoomPosition(25, 25, bee.memory.targetRoom));
        }
        else{
            var source = bee.pos.findClosestByRange(FIND_SOURCES);
            var status = 'none'
            if (bee.carry.energy == bee.carryCapacity){
                bee.memory.status = 'full';
            }
            else if (bee.carry.energy == 0){
                bee.memory.status = 'empty';
            }

            if(bee.memory.status == 'empty') {
                if(bee.harvest(source) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                else(bee.harvest(source));
            }
            else if (bee.memory.status == 'full'){
                var spawns = bee.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN)
                    }
                });
                constructs = bee.room.find(FIND_CONSTRUCTION_SITES);

                if (constructs && constructs.length > 0){

                    if(bee.build(constructs[0]) == ERR_NOT_IN_RANGE) {
                        bee.moveTo(constructs[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else {
                    common.upgradeController(bee);
                }
            }
        }
    }
}