module.exports = {
	findContainerIDFromSource(sourceID){
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
}