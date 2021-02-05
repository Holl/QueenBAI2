var common = require('commonFunctions');
var db = require('debugTools');

module.exports = function(queenName, queenObj){

    // STARTER BEES
    // Fire off the simple logic for our starter bees.
    // They really just grab some energy from a source to get us started.
    // Really super ineffective.
    for(var bee in queenObj['bees']['starter']){
        var beeName = queenObj['bees']['starter'][bee];
        var source = queenObj['localSources'][0];
        starterMining(beeName, queenObj);
    }

    // HARVESTER BEES
    // Very dumb bees at the moment, but by design.
    // The whole life cycle is, spawn, go to souce, mine until death.
    for (var bee in queenObj['bees']['harvester']){
        var beeName = queenObj['bees']['harvester'][bee];
        var beeObj = Game.creeps[beeName];
        source = Game.getObjectById(beeObj.memory.source);
        mineSource(beeObj, source);
    }


    // HAULER BEES
    // The important work force for our hive.  Now we have some actual logic.
    // But first we need to prepare.

    var thirstyStructuers = [];

    // First, we want to prepare an array of objects-
    // these are all the structures that require energy in some way.
    // This is the concept of "Thirst"- a number value representing how much
    // energy the building needs.
    for (var structureName in queenObj['energyStructuers']){
        var struct = queenObj['energyStructuers'][structureName];
        if(struct['store']["energy"]<struct['energyCapacity']){
            var howThirsty = struct['energyCapacity'] - struct['store']["energy"];
            var obj = {"name": struct.name, "id": struct.id, "thirst":howThirsty}
            thirstyStructuers.push(obj);
        }
    }

    // Next, we want to do one loop thorugh our bees to see which ones
    // are already taking care of thos buildings.
    // If there is a delivery being done, remove that bee's energy store
    // from the Thirst no.  If thirst then becomes 0, remove it from the list.

    for (var bee in queenObj['bees']['hauler']){
        var beeName = queenObj['bees']['hauler'][bee];
        var bee = Game.creeps[beeName];
        if (bee.memory.deliveryTargetID){
            for (var struct in thirstyStructuers){
                if (thirstyStructuers[struct]['id'] == bee.memory.deliveryTargetID){
                    if (thirstyStructuers[struct]['thirst'] < bee['carry']['energy']){
                        thirstyStructuers.splice(struct,1);
                    }
                    else{
                        thirstyStructuers[struct]['thirst'] = thirstyStructuers[struct]['thirst'] - bee['carry']['energy'];
                    }
                }
            }
        }
    }


    for (var bee in queenObj['bees']['drone']){
        var beeName = queenObj['bees']['drone'][bee];
        var bee = Game.creeps[beeName];
        if (bee.memory.deliveryTargetID){
            for (var struct in thirstyStructuers){
                if (thirstyStructuers[struct]['id'] == bee.memory.deliveryTargetID){
                    if (thirstyStructuers[struct]['thirst'] < bee['carry']['energy']){
                        thirstyStructuers.splice(struct,1);
                    }
                    else{
                        thirstyStructuers[struct]['thirst'] = thirstyStructuers[struct]['thirst'] - bee['carry']['energy'];
                    }
                }
            }
        }
    }

    // And this is the bee's actual logic:

    for (var bee in queenObj['bees']['hauler']){
        var beeName = queenObj['bees']['hauler'][bee];
        var bee = Game.creeps[beeName];
        var source = Game.getObjectById(bee.memory.source);
        if(bee.carry.energy == 0){
            // If we don't have any energy, we want to reset and find our resource.

            bee.memory.deliveryTargetID = '';
            if (bee.memory.pickupID){
                // If we stored where we need to pick up, go there.
                var pickup = Game.getObjectById(bee.memory.pickupID);
                if (!pickup){
                    // Handler if this doesn't exist.
                    bee.memory.pickupID = common.findContainerIDFromSource(source.id);
                    pickup = Game.getObjectById(bee.memory.pickupID);
                }
                if (pickup.progressTotal){
                    var target = source.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
                    if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                        bee.moveTo(target.pos);
                    }
                }
                else{
                    if (bee.withdraw(pickup, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                        bee.moveTo(pickup.pos)
                    }
                    else if (bee.withdraw(pickup, RESOURCE_ENERGY) == ERR_INVALID_TARGET){
                        bee.memory.pickupID = common.findContainerIDFromSource(source.id);
                    }
                }
            }
            else{
                var target = source.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
                if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(target.pos);
                }
                else if (!target){
                    bee.memory.pickupID = common.findContainerIDFromSource(source.id); 
                }
            }
        }
        else {
            // Otherwise we have some energy and should do something with
            // If we're here, there are buildings with Thirst...
            if(bee.memory.deliveryTargetID){
                // And if we have a delivery target, we should go to it to deliver.
                var deliveryID = bee.memory.deliveryTargetID;
                var deliveryObj = Game.getObjectById(deliveryID);
                if(bee.transfer(deliveryObj, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(deliveryObj);
                }
                if(bee.transfer(deliveryObj, RESOURCE_ENERGY) == ERR_FULL){
                    bee.memory.deliveryTargetID = '';
                }
            }
            else if (thirstyStructuers.length>0){

                // If we don't have a delivery target, grab the first on the list
                // and reduce or remove it from the list.
                bee.memory.deliveryTargetID = thirstyStructuers[0]['id'];

                if (thirstyStructuers[0]['thirst'] < bee['carry']['energy']){
                    thirstyStructuers.splice(0,1);
                }
                else{
                    thirstyStructuers[0]['thirst'] = thirstyStructuers[0]['thirst'] - bee['carry']['energy'];
                }
            }
            else if (queenObj['constructionSites'].length > 0){
                var site = queenObj['constructionSites'][0];
                if(bee.build(site) == ERR_NOT_IN_RANGE){
                    bee.moveTo(site);
                }
            }
            else{
                upgradeController(bee);
            } 
        }
    }

    for (var bee in queenObj['bees']['shipper']){
        var beeName = queenObj['bees']['shipper'][bee];
        var bee = Game.creeps[beeName];
        if(bee.carry.energy == 0){      
            if(!bee.memory.pickupID){
                var source = Game.getObjectById(bee.memory.source);
                bee.memory.pickupID = common.findContainerIDFromSource(source.id);
            }
            var pickup = Game.getObjectById(bee.memory.pickupID);
            console.log(bee.pickup(target));
            if (bee.withdraw(pickup, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                bee.moveTo(pickup.pos)
            }
            else if (bee.withdraw(pickup, RESOURCE_ENERGY)== ERR_INVALID_TARGET){
                if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(target.pos);
                }
            }

        }
        else{
            var storageID = bee.memory.storage;
            var storage = Game.getObjectById(storageID);
            if(bee.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                bee.moveTo(storage);
            }
        }
    }

    for (var bee in queenObj['bees']['drone']){
        var beeName = queenObj['bees']['drone'][bee];
        var bee = Game.creeps[beeName];
        if(bee.carry.energy == 0){      
            if (bee.memory.storage){
                var storageID = bee.memory.storage;
                var storage = Game.getObjectById(storageID);
            }
            else{
                var storageObj = Game.rooms[queenName].find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}});
                var storage = storageObj[0];

            }
            if(bee.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                bee.moveTo(storage);
            }
        }
        else{
            if (thirstyStructuers.length > 0 || bee.memory.deliveryTargetID){
                if(!bee.memory.deliveryTargetID){
                    // And if we have a delivery target, we should go to it to deliver.
                    bee.memory.deliveryTargetID = thirstyStructuers[0]['id'];
                    if (thirstyStructuers[0]['thirst'] < bee['carry']['energy']){
                        thirstyStructuers.splice(0,1);
                    }
                    else{
                        thirstyStructuers[0]['thirst'] = thirstyStructuers[0]['thirst'] - bee['carry']['energy'];
                    }
                }
                var deliveryID = bee.memory.deliveryTargetID;
                var deliveryObj = Game.getObjectById(deliveryID);
                // If we don't have a delivery target, grab the first on the list
                // and reduce or remove it from the list.
                bee.transfer(deliveryObj, RESOURCE_ENERGY);               
                if(bee.transfer(deliveryObj, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(deliveryObj);
                }
                if(bee.transfer(deliveryObj, RESOURCE_ENERGY) == ERR_FULL){
                    bee.memory.deliveryTargetID = '';
                }
            }
        }
    }
    for (var bee in queenObj['bees']['upgrader']){
        var beeName = queenObj['bees']['upgrader'][bee];
        var bee = Game.creeps[beeName];
        if(bee.carry.energy == 0){      
            if (bee.memory.storage){
                var storageID = bee.memory.storage;
                var storage = Game.getObjectById(storageID);
                // ?? Feels like there should be some GOTO storage logic here
            }
            else if (bee.memory.pickupID){
                var target = Game.getObjectById(bee.memory.pickupID);
                if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(target.pos);
                }
                else if(target.structureType == 'container'){
                     if (bee.withdraw(target, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                        bee.moveTo(target.pos)
                    }
                }
                else if (!target){
                    bee.memory.pickupID = common.findContainerIDFromSource(source.id); 
                }
            }
            else{
                console.log("Hopefully this runs once?");
                var storageObj = Game.rooms[queenName].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}});
                var storage = storageObj[0]; 
                if (storage){
                    bee.memory.storage = storageObj[0].id;
                }
                else{
                    var source = Game.rooms[queenName].controller.pos.findClosestByPath(FIND_SOURCES);
                    var target = source.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
                    if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                        bee.moveTo(target.pos);
                    }
                    else if (!target){
                        bee.memory.pickupID = common.findContainerIDFromSource(source.id); 
                    }
                }
                // This doesn't work pre storage, need a fix
            }
            if(bee.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                bee.moveTo(storage);
            }
        }
        else{
            upgradeController(bee);
        } 
    }
}


// Logic to get the starter bee started
// This is pretty old school shit and very rough around the edges.
// It should probably be retired but it's used like once.
function starterMining(beeName, queenObj){
    var source = Game.getObjectById(queenObj['localSources'][0]);
    var bee = Game.creeps[beeName];
    if(bee.carry.energy < bee.carryCapacity) {
        if(bee.harvest(source) == ERR_NOT_IN_RANGE) {
            bee.moveTo(source);
        }
        else(bee.harvest(source));
    }
    else{
        var targets = bee.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_EXTENSION)&&
                (structure.energy < structure.energyCapacity || 
                    structure.store < structure.storeCapacity))
            }
        });
        if(targets.length > 0) {
            if(bee.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                bee.moveTo(targets[0]);
            }
        }
    }
}

// Very simple function to go to and mine a source.
function mineSource(bee, source){
    if(bee.harvest(source) == ERR_NOT_IN_RANGE || bee.harvest(source) == ERR_BUSY) {
        if (bee.memory.pickupID){
            var container = Game.getObjectById(bee.memory.pickupID);
            bee.moveTo(container);
        }
        else{
            bee.memory.pickupID = common.findContainerIDFromSource(source.id);
            bee.moveTo(source);
        }
        
    }
    else{
        var container = Game.getObjectById(bee.memory.pickupID);
        bee.moveTo(container);
        bee.harvest(source);
        if(!bee.memory.container){
            bee.room.createConstructionSite(bee.pos.x, bee.pos.y, STRUCTURE_CONTAINER);
            bee.memory.container = 1;
        }
    }
}

// Function to go to and upgrade a controller.
function upgradeController(bee){
    if(bee.upgradeController(bee.room.controller) == ERR_NOT_IN_RANGE) {
        bee.moveTo(bee.room.controller);
    }
}