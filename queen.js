const verboseLogging = 0;
const noHaulers = 4;

var creepCreator = require('beeSpawner');
var db = require('debugTools');

module.exports = function(queenName, empressOrders, queenObj){

    // TODO: Logic to objey the empress

    // TODO: Logic to defend the Queen's terriotiry

    //"OTHERWISE" we should just expand economy:

    maintenanceSpawning(queenName, queenObj); 
    maintenanceBeesFunction(queenName, queenObj);
    normalEconomySpawning(queenName, queenObj);
    econBeesFunction(queenName, queenObj);
    captureSpawning(queenName, queenObj, empressOrders);
    captureFunciton(queenName, queenObj, empressOrders);
    defnseFunction(queenName, queenObj);


    
}

function captureSpawning(queenName, queenObj, empressOrders){

    if(queenObj['inactiveSpawns'].length == 0){
        return;
    }

    var beeLevel = calculateLevel(queenObj['energyMax']);
    if (empressOrders && empressOrders['order']=='capture' && beeLevel > 2){
        if(typeof queenObj['bees']['captor'] == 'undefined' && 
            Game.rooms[empressOrders['room']].controller.my == false){
            console.log("We'd like to spawn a captor");
            creepCreator(queenObj['inactiveSpawns'][0], 
                                        'captor', 
                                        beeLevel,
                                        queenName,
                                        {'targetRoom':empressOrders['room']}
                                    );
            return;
        }
        if (typeof queenObj['bees']['captorBuilder'] == 'undefined' ||
            queenObj['bees']['captorBuilder'].length < 4){

            console.log("We'd like to spawn a captor builder.");
            creepCreator(queenObj['inactiveSpawns'][0], 
                                        'captorBuilder', 
                                        beeLevel,
                                        queenName,
                                        {'targetRoom':empressOrders['room']}
                                    );
            return;
        }
    }
}

function captureFunciton(queenName, queenObj, empressOrders){
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

function normalEconomySpawning(queenName, queenObj){
    // First, if all the spawns are active, we don't really need to do anything.
    // Because we can't do antyhing.
    if(queenObj['inactiveSpawns'].length == 0){
        return;
    }

    var beeLevel = calculateLevel(queenObj['energyMax']);

    if (_.isEmpty(queenObj['bees'])){
        // This runs only if we have 0 bees anywhere.
        if (beeLevel == 1 || queenObj['energyNow'] < 500){
            // This will run if our creep level is 1, meaning that we're probably starting off
            // or things are really bad.
            creepCreator(queenObj['inactiveSpawns'][0], "starter", 1, queenName);
            return;
        }
        else{
            // If our Bee Level isn't 1, then our structures are OK- just we have no creeps,
            // and we should probably try to spin something larger up.

            // TODO: Write some more normal functionality for this edgecase.
            return;
        }
    }

    // So from the Herald's queen object, get the array of 
    // bees that exist with harvester and hauler tasks.

    var harvesterArray = queenObj['bees']['harvester'];
    var haulerArray = queenObj['bees']['hauler'];
    var localSources = queenObj['localSources'];

    var harvestedSourceArray=[];
    var hauledSourceObject={};

    // Loop through all of our harvesters.
    // The result of this is an array (harvestedSourceArray) of all the sources
    // currently being mined.

    // TOPDO: The following two loops seem REALLY similar,
    // and I probably have to do it again.  Make them wet

    for (var harvester in harvesterArray){
        for (source in localSources){
            if (Game.creeps[harvesterArray[harvester]].memory.source == localSources[source]){
                harvestedSourceArray.push(localSources[source]);
            }
        }
    }

    // Same thing for haulers, but we had an object with each one.
    // Easier to keep track of all of em that way.

    for (var hauler in haulerArray){
        for (source in localSources){
            if (Game.creeps[haulerArray[hauler]].memory.source == localSources[source]){
                if(!hauledSourceObject[localSources[source]]){
                     hauledSourceObject[localSources[source]] =[haulerArray[hauler]];
                }
                else{
                     hauledSourceObject[localSources[source]].push(haulerArray[hauler])
                }
            }
        }
    }

    // So what isn't being mined?  unharvestSourceArray is an array of the leftover,
    // unmined sources.
    var unharvestedSourceArray = _.difference(localSources, harvestedSourceArray);

    // Which should give us everyting we need.
    // So, for all our local sources:
    for (var source in localSources){
        // If we there are no harvesters assinged to this source...
        if (unharvestedSourceArray.includes(localSources[source])){
            // Create a harvester bee and set it loose on the source.
            // Return cuz we're done.
            var container = findContainerID(localSources[source]);
            if (container){
                creepCreator(queenObj['inactiveSpawns'][0], 
                                'harvester', 
                                beeLevel,
                                queenName,
                                {'source':localSources[source],
                                'pickupID': container.id,
                                'container': 1
                                }
                            );
            }
            else{
                 creepCreator(queenObj['inactiveSpawns'][0], 
                                'harvester', 
                                beeLevel,
                                queenName,
                                {'source':localSources[source]}
                            );
            }
            return;
        }
        else if (!hauledSourceObject[localSources[source]] || hauledSourceObject[localSources[source]].length < noHaulers){
            // Otherwise, if hauledSourceObject doesn't have a value withe the key
            // of source, we know that source doesn't have haulers.
            // If it does, but he count is below our const, we still need more.

            creepCreator(queenObj['inactiveSpawns'][0], 
                'hauler',
                beeLevel, 
                queenName,
                {'source':localSources[source]}
            );
            return;
        }
    }
};

function econBeesFunction(queenName, queenObj){

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

    // And this is the bee's actual logic:

    for (var bee in queenObj['bees']['hauler']){
        var beeName = queenObj['bees']['hauler'][bee];
        var bee = Game.creeps[beeName];
        var source = Game.getObjectById(bee.memory.source);
        if(bee.carry.energy == 0){
            // If we don't have any energy, we want to reset and find
            // dropped resources around a source.
            bee.memory.deliveryTargetID = '';
            if (bee.memory.pickupID){
                // If we stored where we need to pick up, go there.
                var pickup = Game.getObjectById(bee.memory.pickupID);
                if (!pickup){
                    // Handler if this doesn't exist.
                    bee.memory.pickupID = findContainerID(source.id);
                    pickup = Game.getObjectById(bee.memory.pickupID);
                }
                else{
                    // console.log(bee.name + " donesn't know where to go.")
                }
                if (pickup.progressTotal){
                    var target = source.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
                    if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                        bee.moveTo(target.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
                else{
                    if (bee.withdraw(pickup, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                        bee.moveTo(pickup.pos, {visualizePathStyle: {stroke: 'blue'}})
                    }
                    else if (bee.withdraw(pickup, RESOURCE_ENERGY) == ERR_INVALID_TARGET){
                        bee.memory.pickupID = findContainerID(source.id);
                    }
                }
            }
            else{
                var target = source.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
                if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(target.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                else if (!target){
                    bee.memory.pickupID = findContainerID(source.id); 
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
                    bee.moveTo(deliveryObj, {visualizePathStyle: {stroke: '#ffffff'}});
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
                    bee.moveTo(site, {visualizePathStyle: {stroke: 'white'}});
                }
            }
            else{
                upgradeController(bee);
            } 
        }
    }
}

function maintenanceSpawning(queenName, queenObj){
    if(queenObj['inactiveSpawns'].length == 0){
        return;
    }

    var beeLevel = calculateLevel(queenObj['energyMax']);
    var queenLevel = queenObj['level'];
    var noWorkers = queenLevel - 1;

    if (queenObj['bees']['worker'] < noWorkers || (!queenObj['bees']['worker'] && noWorkers > 0)){
        creepCreator(queenObj['inactiveSpawns'][0], 
                                'worker', 
                                beeLevel,
                                queenName
                            );
    }
}

function maintenanceBeesFunction(queenName, queenObj){
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
                        ourBee.moveTo(container.pos, {visualizePathStyle: {stroke: 'blue'}})
                    }
                }
                else{
                    var containers = ourBee.room.find(FIND_STRUCTURES, 
                        {filter: {structureType: STRUCTURE_CONTAINER }}
                    );
                    if (containers){
                        var container = ourBee.pos.findClosestByRange(containers);
                        ourBee.memory.pickupID = container.id;
                        if (ourBee.withdraw(container, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                            ourBee.moveTo(container.pos, {visualizePathStyle: {stroke: 'blue'}})
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
                    if(repairArray.length > 0) {
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

function defnseFunction(queenName, queenObj){
    if (queenObj['hostilePower'] > 0){
        var hostiles = Game.rooms[queenName].find(FIND_HOSTILE_CREEPS);
        if(hostiles.length > 0) {
            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${queenName}`);
            var towers = Game.rooms[queenName].find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            towers.forEach(tower => tower.attack(hostiles[0]));
        }
    }
}

function findContainerID(sourceID){

    var sourcePos = Game.getObjectById(sourceID).pos
    var container = sourcePos.findInRange(FIND_STRUCTURES,1,
        {filter: {structureType: STRUCTURE_CONTAINER}});
    if (Object.keys(container).length == 0){
        container = sourcePos.findInRange(FIND_CONSTRUCTION_SITES,1);
    }
    if (Object.keys(container).length == 0){
        return false;
    }
    else{
        return container[0].id;
    }
}

// Very simple function to go to and mine a source.
function mineSource(bee, source){
    if(bee.harvest(source) == ERR_NOT_IN_RANGE || bee.harvest(source) == ERR_BUSY) {
        if (bee.memory.pickupID){
            var container = Game.getObjectById(bee.memory.pickupID);
            bee.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        else{
            bee.memory.pickupID = findContainerID(source.id);
            bee.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        
    }
    else{
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
        bee.moveTo(bee.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
    }
}

// A simple check, based on our max energy storage, on how advanced we want our creeps to be.
function calculateLevel(energyMax){
    if (energyMax < 550){
        return 1;
    }
    else if (550 <=  energyMax && energyMax < 800){
        return 2;
    }
    else if (800 <= energyMax && energyMax < 1300){
        return 3;
    }
    else if (1300 <= energyMax){
        return 4;
    }
};

// Logic to get the starter bee started
// This is pretty old school shit and very rough around the edges.
// It should probably be retired but it's used like once.
function starterMining(beeName, queenObj){
    var source = Game.getObjectById(queenObj['localSources'][0]);
    var bee = Game.creeps[beeName];
    if(bee.carry.energy < bee.carryCapacity) {
        if(bee.harvest(source) == ERR_NOT_IN_RANGE) {
            bee.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        else(bee.harvest(source));
    }
    else{
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
    }
}