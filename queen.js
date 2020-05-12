module.exports = function(queenName, empressOrders, queenObj){

    // TODO: Logic to objey the empress

    // TODO: Logic to defend the Queen's terriotiry

    //"OTHERWISE" we should just expand economy:
    normalEconomySpawning(queenName, queenObj);
    econScreepsFunction(queenName, queenObj);    
}





function normalEconomySpawning(queenName, queenObj){
    // First, if all the spawns are active, we don't really need to do anything.
    if(queenObj['inactiveSpawns'].length == 0){
        console.log("All spawns anywhere busy");
        return;
    }

    var beeLevel = calculateLevel(queenObj['energyMax']);

    if (_.isEmpty(queenObj['bees'])){
        // This runs only if we have 0 bees anywhere.
        if (beeLevel == 1 || queenObj['energyNow'] < 500){
            // This will run if our creep level is 1, meaning that we're probably starting off
            // or things are really bad.
            console.log("No bees under Queen "+ queenName +"'s command!");
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

    // We (eventually) want 1 harvester per resource.  This is probably a good place to start.

    // Check for the harvesters...
    var harvesterArray = queenObj['bees']['harvester'];
    var haulerArray = queenObj['bees']['hauler'];
    var localSources = queenObj['localSources'];
    
    if (!harvesterArray){
        creepCreator(queenObj['inactiveSpawns'][0], 
            "harvester", 
            1, 
            queenName, 
            {'sourceTarget':localSources[0]}
        )
        return;
    }

    if (!haulerArray){
        creepCreator(queenObj['inactiveSpawns'][0], 
                "hauler", 
                1, 
                queenName, 
                {'sourceTarget':localSources[0]}
            )
        return;
    }

    // for (var i = 0; i < localSources.length; i++){
    //     for (var harvester in harvesterArray){
    //         var sourceTarget = harvesterArray[harvester].memory.sourceTarget;
    //         if(!localSources[i] == sourceTarget){
    //             creepCreator(queenObj['inactiveSpawns'][0], 
    //                 "harvester", 
    //                 1, 
    //                 queenName, 
    //                 {'sourceTarget':localSources[i]}
    //             )
    //         }
    //     }

    //     for (var hauler in haulerArray){
    //         var sourceTarget = haulerArray[hauler].memory.sourceTarget;
    //         if(!localSources[i] == sourceTarget){
    //             creepCreator(queenObj['inactiveSpawns'][0], 
    //                 "hauler", 
    //                 1, 
    //                 queenName, 
    //                 {'sourceTarget':localSources[i]}
    //             )
    //         }
    //     }
    // }
}

function econScreepsFunction(queenName, queenObj){
    // db(queenObj);

    for(var bee in queenObj['bees']['starter']){
        var beeName = queenObj['bees']['starter'][bee];
        var source = queenObj['localSources'][0];
        starterMining(beeName, source);
    }

    for (var bee in queenObj['bees']['harvester']){
        var beeName = queenObj['bees']['harvester'][bee];;
        var source = queenObj['localSources'][0];
        harvesterMining(beeName, source);
    }

    for (var bee in queenObj['bees']['hauler']){
        var beeName = queenObj['bees']['hauler'][bee];;
        var source = queenObj['localSources'][0];
        hauling(beeName, source);
    }
}



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

function starterMining(beeName, sourceName){
    var source = Game.getObjectById(sourceName);
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

function harvesterMining(beeName, sourceName, delivery){
    var source = Game.getObjectById(sourceName);
    var bee = Game.creeps[beeName];
    if(bee.harvest(source) == ERR_NOT_IN_RANGE) {
            bee.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    else(bee.harvest(source));
}

function hauling(beeName, sourceName){
    
}

function creepCreator(spawnName, roleName, creepLevel, queenName, metaData){
    var body = getBody(roleName, creepLevel);
    var name = roleName + "_lvl" + creepLevel + "_" + Game.time.toString();
    var finalMetaData = {
        ...{'role': roleName, 'queen': queenName},
        ...metaData
    }

    Game.spawns[spawnName].spawnCreep(body, name, { memory: finalMetaData});
}

function checkTargetedCreepsAmount(scanData, targets, max, num, source){
    if (scanData[targets][scanData[source][num]] < max || !(scanData[targets][scanData[source][num]])){
        return true;
    }
    else {return false};
}        


function getBody(role, level){
    switch (role){
        case "starter": return getBody_Starter(level);
        case "worker": return getBody_Worker(level);
        case "harvester": return getBody_Harvester(level);
        case "builder": return getBody_Builder(level);
        case "defender": return getBody_Defender(level);
        case "hauler": return getBody_Hauler(level);
        case "scout": return getBody_Scout(level);
        case "capture": return getBody_Capture(level);
        case "swarm": return getBody_Swarm(level);
    }
}

function getBody_Swarm(level){
    switch (level){
        case 1: return [TOUGH, MOVE, MOVE, ATTACK];
        case 2: return [TOUGH, MOVE, MOVE, ATTACK];
        case 3: return [TOUGH, MOVE, MOVE, ATTACK];
        case 4: return [TOUGH, MOVE, MOVE, ATTACK];
    }
}

function getBody_Starter(level){
    switch (level){
        case 1: return [MOVE, 
                        WORK, CARRY];
    }
}

function getBody_Scout(level){
    switch (level){
        case 1: return [MOVE];
    }
}

function getBody_Capture(level){
    switch (level){
        case 1: return [CLAIM, MOVE];
        case 2: return [CLAIM, MOVE];
        case 3: return [CLAIM, MOVE];
        case 4: return [CLAIM, MOVE];
    }
}

function getBody_Harvester(level){
    switch (level){
        case 1: return [MOVE, 
                        WORK, WORK];
        case 2: return [MOVE, 
                        WORK, WORK, WORK, WORK];
        case 3: return [MOVE, 
                        WORK, WORK, WORK, WORK, WORK];
        case 4: return [MOVE, MOVE, MOVE, MOVE, MOVE, 
                        WORK, WORK, WORK, WORK, WORK];
    }
}

function getBody_Builder(level){
    switch (level){
        case 1: return [
                        CARRY, 
                        MOVE, 
                        WORK
                        ]
        case 2: return [
                        CARRY, CARRY, CARRY,
                        WORK, WORK, 
                        MOVE, MOVE, MOVE
                        ];
        case 3: return [
                        CARRY, CARRY, CARRY, CARRY, CARRY,
                        WORK, WORK, WORK, WORK,
                        MOVE, MOVE, MOVE
                        ];
        case 4: return [
                        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        WORK, WORK, WORK, WORK, WORK,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
                        ];
    }
}

function getBody_Defender(level){
    switch (level){
        case 1: return [
                        ATTACK, MOVE
                        ];
        case 2: return [
                        RANGED_ATTACK, RANGED_ATTACK, 
                        MOVE, MOVE
                        ];
        case 3: return [
                        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
                        MOVE, MOVE, MOVE, MOVE
                        ];
        case 4: return [
                        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
                        MOVE, MOVE, MOVE, MOVE, MOVE
                        ];
    }
}

function getBody_Worker(level){
    switch (level){
        case 1: return [
                        CARRY, 
                        MOVE, 
                        WORK
                        ]
        case 2: return [
                        CARRY, CARRY, CARRY,
                        WORK, WORK, 
                        MOVE, MOVE, MOVE
                        ];
        case 3: return [
                        CARRY, CARRY, CARRY, CARRY, CARRY,
                        WORK, WORK, WORK, WORK,
                        MOVE, MOVE, MOVE
                        ];
        case 4: return [
                        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        WORK, WORK, WORK, WORK, WORK,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
                        ];
    }
    
}

function getBody_Hauler(level){
    switch (level){
        // 550, 800, 1300
        case 1: return [CARRY, MOVE]
        case 2: return [CARRY, CARRY, CARRY, CARRY, 
                        MOVE, MOVE, MOVE, MOVE];
        case 3: return [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        case 4: return [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    }
}

function db(obj){
    console.log(JSON.stringify(obj));
}