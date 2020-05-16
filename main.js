// 
//   QueenBAI2
//     _  _
//    | )/ )
// \\ |//,' __
// (")(_)-"()))=-
//    (\\
// 
// This AI is modeled around an imaginary cluster of Hives- the key difference is the inclusion of an 
// "empress" above the Queens, in charge of the empire.

// First, we need our "Herald" functions.  These are informative, not choice making.  They will return
// data dependinng on their design.  They will report their data, first to the Empress, then the Queens.
var runHerald = require('herald');
// The Empress make empire-level decisions.
var runEmpress = require('empress');
// The Queen makes spawn-level decissions.
var runQueen = require('queen');
// The Captain relays the orders to the bees.
var runCaptain = require('captain');
// The Carpender decides what should be built, when and where.
var runCarpender = require('carpender');

module.exports.loop = function () {
    // console.log("~~~~~~~~~~"+ Game.time+"~~~~~~~~~~");
    
    var heraldReport = runHerald();

    var empressOrders = runEmpress(heraldReport);

    for (var queenName in heraldReport['queenObject']){
    	var queenObj = heraldReport['queenObject'][queenName];
    	runQueen(queenName, empressOrders, queenObj);
        runCarpender(queenName, heraldReport['queenObject'][queenName]);
    }

    // console.log("Currently " + Game.cpu.bucket + 
    //     " in the bucket, with " + Game.cpu.tickLimit + 
    //     " as the current tick limit.");
}