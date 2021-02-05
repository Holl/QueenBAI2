module.exports = function(queenName, queenObj){
    var repairArray = Game.rooms[queenName].find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax
    });

    if (repairArray.length > 0){
        repairArray.sort((a,b) => a.hits - b.hits);
        for (var bee in queenObj['bees']['worker']){
            var beeName = queenObj['bees']['worker'][bee];
            var ourBee = Game.creeps[beeName];
            if(ourBee.carry.energy == 0){
                ourBee.memory.repairTarget = '';
                if (ourBee.memory.pickupID){
                    var container = Game.getObjectById(ourBee.memory.pickupID);
                    if (ourBee.withdraw(container, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                        ourBee.moveTo(container.pos)
                    }
                }
                else{
                    var containers = ourBee.room.find(FIND_STRUCTURES, 
                        {filter: {structureType: STRUCTURE_CONTAINER }}
                    );
                    var storage = ourBee.room.find(FIND_STRUCTURES, 
                        {filter: {structureType: STRUCTURE_STORAGE }}
                    );
                    if (storage && storage.length>0){
                        containers = storage;
                    }
                    if (containers.length>0){
                        var container = ourBee.pos.findClosestByRange(containers);
                        ourBee.memory.pickupID = container.id;
                        if (ourBee.withdraw(container, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                            ourBee.moveTo(container.pos)
                        }
                    }
                }
            }
            else{
                if (ourBee.memory.repairTarget){
                    var storedTarget = Game.getObjectById(ourBee.memory.repairTarget);
                    if (storedTarget.hits < storedTarget.hitsMax){
                        ourBee.moveTo(storedTarget);
                        ourBee.repair(storedTarget);
                    }
                    else{
                        ourBee.memory.repairTarget = repairArray[0].id;
                        repairArray.splice(0,1);  
                    }
                }
                else {
                    if(queenObj['constructionSites'] && queenObj['constructionSites'].length>0){
                        var site = queenObj['constructionSites'][0];
                        if(ourBee.build(site) == ERR_NOT_IN_RANGE){
                            ourBee.moveTo(site);
                        }
                    }
                    else if(repairArray.length > 0) {
                        if(ourBee.repair(repairArray[0]) == ERR_NOT_IN_RANGE) {
                            ourBee.moveTo(repairArray[0]);
                        }
                        ourBee.memory.repairTarget = repairArray[0].id;
                        repairArray.splice(0,1);
                    }
                }
            }
        }
    }
    
}