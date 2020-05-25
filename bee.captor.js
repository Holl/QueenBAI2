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
                var targets = bee.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN)
                    }
                });
                if(targets.length > 0) {
                    if(bee.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        bee.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else{
                    targets = bee.room.find(FIND_CONSTRUCTION_SITES);
                    if(targets.length > 0) {
                        if(bee.build(targets[0]) == ERR_NOT_IN_RANGE) {
                            bee.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
            }
        }
    }
}