'use strict';
var _ = require('lodash');
var rest = require('unirest');
var async = require('async');


var doLookup = function(entities, options, cb){
    if(typeof cb !== 'function'){
        return;
    }


    if(typeof(options.apikey) !== 'string' || options.apikey.length === 0){
        cb("The API key is not set.");
        return;
    }


    var entityResults = new Array();

    //look up all of the entities that are geo codes before continuing and push them into the entityResults
    async.each(entities, function(entity, done){
        if(entity.isGeo){
            console.log("https://maps.googleapis.com/maps/api/geocode/json?latlng="+entity.latitude+","+entity.longitude+"&key="+options.apikey);

            //do a reverse geocoding lookup using google maps
            rest.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+entity.latitude+","+entity.longitude+"&key="+options.apikey)
                .end(function(response){
                    if( _.isObject(response.body) ){
                        var resultsObject = response.body;

                        //if the status is OK and not an error
                        if(resultsObject.status === "OK"){
                            var tags = new Array();

                            //add any tags that the user should know (right now just the first formatted address)
                            entityResults.push({
                                entity: entity.value,
                                result: {
                                    entity_name:entity.value,
                                    tags: [resultsObject.results[0].formatted_address],
                                    details: entity
                                }
                            });
                        }
                    }

                    done();

                });
        }else{
            done();
        }
    },function(){
        cb(null, entityResults.length, entityResults);
    });



};

var doDetailedLookup = function(entities, cb){

    var results = new Array();
    entities.forEach(function(entity){
        results.push({
            entity: entity.value,
            result: "Test integration enriched info"
        })
    });

    cb(null, entities.length, results);
};



module.exports = {
    doLookup: doLookup,
    doDetailedLookup: doDetailedLookup
};