module.exports = function(hearldReport){
    
    // For the first order of business,
    // the empress wants to understand if we SHOULD expand.

    var empressOrders = {};

    var gcl = hearldReport['empireObject']['gcl'];
    var queenCount = Object.keys(hearldReport['queenObject']).length;

    var flags = Game.flags;
    // This is hideous.
    var shortestDistance = 100;
    var shortestDistanceRoom = '';

    for (var flag in flags){
    	if (flags[flag].color == 3){
    		var targetRoom = flags[flag].pos.roomName;
    		for (var queen in hearldReport['queenObject']){
    			var distance = Game.map.getRoomLinearDistance(queen, targetRoom);
    			if (distance < shortestDistance){
    				shortestDistance = distance;
    				shortestDistanceRoom = queen;
    			}
    		}

    		empressOrders[queen] = {
    			"order": "capture",
    			"room": targetRoom
    		}
    	}
    }

    return empressOrders;
}