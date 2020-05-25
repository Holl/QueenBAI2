module.exports = function(spawnName, roleName, creepLevel, queenName, metaData){
	var body = getBody(roleName, creepLevel);
    var name = roleName + "_lvl" + creepLevel + "_" + Game.time.toString();
    var finalMetaData = {
        ...{'role': roleName, 'queen': queenName},
        ...metaData
    }
    Game.spawns[spawnName].spawnCreep(body, name, { memory: finalMetaData});
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
        case "captor": return getBody_Capture(level);
        case "swarm": return getBody_Swarm(level);
        case "captorBuilder": return getBody_CaptorBuilder(level);
        case "shipper": return getBody_Shipper(level);
        case "drone": return getBody_Hauler(level);
    }
}

function getBody_Shipper(level){
    switch (level){
        case 1: return [CARRY, MOVE]
        case 2: return [CARRY, CARRY, CARRY, CARRY, 
                        MOVE, MOVE, MOVE, MOVE];
        case 3: return [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        case 4: return [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    }
}

function getBody_Starter(level){
    switch (level){
        case 1: return [MOVE, 
                        WORK, CARRY];
    }
}

function getBody_CaptorBuilder(level){
    switch (level){
        case 3: return [
                        CARRY, CARRY, CARRY,
                        WORK, WORK, WORK,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
                        ];
    }
}

function getBody_Scout(level){
    switch (level){
        case 1: return [MOVE];
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

function getBody_Hauler(level){
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

function getBody_Capture(level){
    switch (level){
        case 3: return [CLAIM, MOVE];
        case 4: return [CLAIM, MOVE];
    }
}