var noHaulers = 2;
var noShipper = 1;
var noDrones = 2;
var noUpgraders = 1;

var noHealers = 4;
var noTanks = 4;

var creepCreator = require('beeSpawner');
var db = require('debugTools');
var captureFunciton = require('bee.captor');
var econBeesFunction = require('bees.econ');
var common = require('commonFunctions');
var maintenanceBeesFunction = require('bees.maintenance');
var reconnaissanceBeesFunction = require('bees.reconnaissance');
var defenseBeesFunction = require('bees.defense');
var attackBeesFunction = require('bees.attack');

module.exports = function(queenName, empressOrders, queenObj){

    db.vLog("~~~~~~~~" + queenName + "~~~~~~~~");
    db.vLog("Level "+queenObj['level']+".")
    db.vLog("Hostile power is currently " + queenObj['hostilePower'] +".");
    db.vLog("Currently "+queenObj["energyNow"]+" out of a possible "+queenObj["energyMax"]+ " energy.");
    if (empressOrders == 'expand'){
        db.vLog("Empress wants to do aggressive expansion.");
    }

    if(queenObj['inactiveSpawns'].length > 0){
        var beeLevel = calculateLevel(queenObj['energyMax'], queenName);

        db.vLog("Bee level is " + beeLevel);        

        if (empressOrders == 'expand'){
            db.vLog("We have orders to expand!");
            var scoutData = Memory.empress.scoutReports;
            var exits = Game.map.describeExits(queenName);
            var exitArray = [exits[1], exits[3], exits[5], exits[7]];
            var containCheck = common.doesObjectHaveKeysOfArray(exitArray,scoutData);
            var finalCapture = '';
            if (Memory.queens[queenName] && Memory.queens[queenName].finalCapture){
                var finalCapture = Memory.queens[queenName].finalCapture;
                var capRoom = Game.rooms[finalCapture];
                if (capRoom){
                    var storageObj = capRoom.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}});
                    var storage = storageObj[0];
                    if (capRoom && capRoom.controller.level == 4 && storage){
                        console.log("We're done helping " + finalCapture);
                        Memory.empress.scoutReports[finalCapture]['captured'] = true;
                        Memory.queens[queenName].finalCapture = '';                        
                    }
                    else{
                        captureSpawning(queenName, queenObj, finalCapture, beeLevel);
                    }
                }
                else{
                    captureSpawning(queenName, queenObj, finalCapture, beeLevel);
                }
            }
            else if (containCheck){
                db.vLog("We need to pick a room");
                var room = pickExpandRoom(exitArray, scoutData);
                if (!Memory.queens){
                    Memory.queens = {};
                }
                if (!Memory.queens[queenName]){
                    Memory.queens[queenName] = {};
                }
                Memory.queens[queenName].finalCapture = room;
            }
            else{
                db.vLog("We need to scout.");
                reconnaissanceSpawning(queenName, queenObj, beeLevel, empressOrders);
            }
        }
        maintenanceSpawning(queenName, queenObj, beeLevel);
        normalEconomySpawning(queenName, queenObj, beeLevel);
    }
    else{
        db.vLog("There are no inactive spawns.")
    }

    econBeesFunction(queenName, queenObj);
    maintenanceBeesFunction(queenName, queenObj);
    defenseBeesFunction(queenName, queenObj, empressOrders);
    
    captureFunciton(queenName, queenObj, empressOrders);
    reconnaissanceBeesFunction(queenName, queenObj, empressOrders);
    defnseFunction(queenName, queenObj, empressOrders);
    attackBeesFunction(queenName, queenObj, empressOrders);
    
}

function pickExpandRoom(roomsArray, scoutData){
    var topPick='';
    for (roomIndex in roomsArray){
        var roomName = roomsArray[roomIndex];
        var roomData = scoutData[roomName];

        if (roomData['capturable']){
            if(roomData['owner'] == false){
                if (roomData['deposits']){
                    if(Game.rooms[roomName] == undefined || !Game.rooms[roomName].controller.my ){
                        topPick = roomName;
                    }
                }
            }
        }
    }
    return topPick;
}

function reconnaissanceSpawning(queenName, queenObj, beeLevel, empressOrders){
    var scoutArray = queenObj['bees']['scout'];
    if (scoutArray == undefined || scoutArray.length < 1){
        db.vLog("Spawning Scout.");
        creepCreator(queenObj['inactiveSpawns'][0], 
                            'scout', 
                            1,
                            queenName
                        );
        return;
    }
}

function captureSpawning(queenName, queenObj, captureRoom, beeLevel){
    if (beeLevel > 2){
        var needCaptureBool = false;
        var roomObj = Game.rooms[captureRoom];
        if (roomObj == undefined || roomObj.controller.my != true){
            needCaptureBool = true
        }
        if(typeof queenObj['bees']['captor'] == 'undefined' && needCaptureBool){
            db.vLog("Spawning Captor.");
            creepCreator(queenObj['inactiveSpawns'][0], 
                                        'captor', 
                                        beeLevel,
                                        queenName,
                                        {'targetRoom':captureRoom}
                                    );
            return;
        }
        if (typeof queenObj['bees']['captorBuilder'] == 'undefined' ||
            queenObj['bees']['captorBuilder'].length < 4){
            db.vLog("Spawning Captor Builder.");
            creepCreator(queenObj['inactiveSpawns'][0], 
                                        'captorBuilder', 
                                        beeLevel,
                                        queenName,
                                        {'targetRoom':captureRoom}
                                    );
            return;
        }
        if (roomObj.find(FIND_HOSTILE_CREEPS).length > 0 && (queenObj['bees']['defender'] == undefined || queenObj['bees']['defender'] < 2)){
            console.log("Hi")
            creepCreator(queenObj['inactiveSpawns'][0], 
                                        'defender', 
                                        beeLevel,
                                        queenName,
                                        {'targetRoom':captureRoom}
                                    );
        }
    }
}

function normalEconomySpawning(queenName, queenObj, beeLevel){

    if (_.isEmpty(queenObj['bees'])){
        // This runs only if we have 0 bees anywhere.
        if (beeLevel == 1 || queenObj['energyNow'] < 500){
            // This will run if our creep level is 1, meaning that we're probably starting off
            // or things are really bad.
            db.vLog("Spawning starter.");
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

    var shipperArray = queenObj['bees']['shipper'];
    var droneArray = queenObj['bees']['drone'];
    var upgraderArray = queenObj['bees']['upgrader'];

    var tankArray = queenObj['bees']['tank'];
    var healerArray = queenObj['bees']['healer'];

    var harvestedSourceArray=[];
    var hauledSourceObject={};
    var shippedSourceObject={};

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


    // Specialization is a key concept in keeping things as simple and CPU efficent as possible.
    // When we start any room- basically any room from levels 1-4- we don't have any place to put
    // energy that's very efficent except for the conatiners.  Therefore the best thing any bee
    // can do with any energy is put it to good use by USING it.

    // That changes with Storage, however.  Once built, we have 1,000,000 units of storage and we can
    // have the bees dedicate themselves to one task.

    var storage = queenObj['storage'];

    // The following is copy/paste.
    // TODO: Move into funct.

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

    for (var shipper in shipperArray){
        for (source in localSources){
            if (Game.creeps[shipperArray[shipper]].memory.source == localSources[source]){
                if(!shippedSourceObject[localSources[source]]){
                     shippedSourceObject[localSources[source]] =[shipperArray[shipper]];
                }
                else{
                     shippedSourceObject[localSources[source]].push(shipperArray[shipper])
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
            db.vLog("Spawning Harvester.");
            var container = common.findContainerIDFromSource(localSources[source]);

            // Emergency lvl 1 harvester, in case there isn't the energy to support a full one?
            // 
            // creepCreator(queenObj['inactiveSpawns'][0], 
            //                     'harvester', 
            //                     1,
            //                     queenName,
            //                     {'source':localSources[source],
            //                     'pickupID': container.id,
            //                     'container': 1
            //                     }
            //                 );
            
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
        // If we HAVE a real storage, we can be more specialized, and therefore, CPU efficent.
        // else if (storage) was here, but this all seems crazy.
        else if (storage){
            noUpgraders = 1;
            var storEng = Game.getObjectById(storage).store.energy;
            if (storEng > 100000){
                noUpgraders++;
            }
            if (storEng > 250000){
                noUpgraders++;
            }
            if (storEng > 500000){
                noUpgraders++;
            }
            if(!shippedSourceObject[localSources[source]] || 
                shippedSourceObject[localSources[source]].length < noShipper){
                db.vLog("Spawning Shipper.");
                creepCreator(queenObj['inactiveSpawns'][0], 
                                    'shipper', 
                                    beeLevel,
                                    queenName,
                                    {'source':localSources[source],
                                    'storage': storage}
                                );
                return;
            }
            else if (droneArray == undefined && queenObj["energyNow"] < 301){
                db.vLog("Spawning Lvl 1 Drone.");
                creepCreator(queenObj['inactiveSpawns'][0], 
                                    'drone', 
                                    1,
                                    queenName
                                );
                return;
            }
            else if (droneArray == undefined || droneArray.length < noDrones){
                db.vLog("Spawning big Drone.");
                creepCreator(queenObj['inactiveSpawns'][0], 
                                    'drone', 
                                    beeLevel,
                                    queenName
                                );
                return;   
            }
            else if (upgraderArray == undefined){
                db.vLog("Spawning Upgrader.");
                creepCreator(queenObj['inactiveSpawns'][0], 
                                    'upgrader', 
                                    1,
                                    queenName
                                );
                return;
            }
            else if (upgraderArray.length < noUpgraders){
                db.vLog("Spawning Upgrader.  We should spin up " + noUpgraders);
                creepCreator(queenObj['inactiveSpawns'][0], 
                                    'upgrader', 
                                    beeLevel,
                                    queenName
                                );
                return;
            }
            // else if (queenName == "W28N29" && tankArray.length < noTanks ){
            //     creepCreator(queenObj['inactiveSpawns'][0], 
            //                             'tank', 
            //                             beeLevel,
            //                             queenName,
            //                             {'targetRoom':"W27N26"}
            //                         );
            // }
            // else if (queenName == "W29N29"){
            //     creepCreator(queenObj['inactiveSpawns'][0], 
            //                             'swarm', 
            //                             beeLevel,
            //                             queenName,
            //                             {'targetRoom':"W27N27"}
            //                         );
            // }
            // else if (queenName == "W27N29" && healerArray.length < noHealers){
            //     creepCreator(queenObj['inactiveSpawns'][0], 
            //                             'healer', 
            //                             beeLevel,
            //                             queenName,
            //                             {'healRoom':"W27N27"}
            //                         );
            // }
            
            return;
        }
        // If not, haulers do basically everything.
        else if (!hauledSourceObject[localSources[source]] || hauledSourceObject[localSources[source]].length < noHaulers){
            // Otherwise, if hauledSourceObject doesn't have a value withe the key
            // of source, we know that source doesn't have haulers.
            // If it does, but he count is below our const, we still need more.
            db.vLog("Spawning Hauler.");
            creepCreator(queenObj['inactiveSpawns'][0], 
                'hauler',
                beeLevel, 
                queenName,
                {'source':localSources[source]}
            );
            return;
        }
        else if (upgraderArray == undefined || upgraderArray.length < 1){
            db.vLog("Spawning Upgrader.");
            creepCreator(queenObj['inactiveSpawns'][0], 
                                'upgrader', 
                                1,
                                queenName
                            );
            return;
        }
    }
};

function maintenanceSpawning(queenName, queenObj, beeLevel){

    var queenLevel = queenObj['level'];
    // var noWorkers = queenLevel - 1;
    var noWorkers = 1;

    if (queenObj['bees']['worker'] && queenObj['bees']['worker'].length < noWorkers || (!queenObj['bees']['worker'] && noWorkers > 0)){
        db.vLog("Spawning a worker.");
        creepCreator(queenObj['inactiveSpawns'][0], 
                                'worker', 
                                beeLevel,
                                queenName
                            );
    }
    return;
}

function defnseFunction(queenName, queenObj){
    if (queenObj['hostilePower'] > 0){
        var hostiles = Game.rooms[queenName].find(FIND_HOSTILE_CREEPS);
        if(hostiles.length > 0) {
            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${queenName}`);
            if (true){
                var towers = Game.rooms[queenName].find(
                    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                towers.forEach(tower => tower.attack(hostiles[0]));
            }
        }
    }
}

// A simple check, based on our max energy storage, on how advanced we want our creeps to be.
function calculateLevel(energyMax, queenName){
    if (energyMax < 550 || Game.rooms[queenName].find(FIND_MY_CREEPS).length <= 2){
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