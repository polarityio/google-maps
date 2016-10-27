'use strict';
var _ = require('underscore');
var rest = require('unirest');
var async = require('async');
var utils = require('util');

var streetReg = /[0-9]*[\s\w\d,]+,\s*[A-Z0-9]{2}\s+[0-9]{5}/i;


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
                                entity: entity,
                                data: {
                                    entity_name:entity.value,
                                    tags: [resultsObject.results[0].formatted_address],
                                    details: entity
                                }
                            });
                        }
                    }

                    done();

                });
        }else if(streetReg.test(entity.value.trim())){
			console.log("https://maps.googleapis.com/maps/api/geocode/json?address="+entity.value+"&key="+options.apikey);

            //do a reverse geocoding lookup using google maps
            rest.get("https://maps.googleapis.com/maps/api/geocode/json?address="+entity.value+"&key="+options.apikey)
                .end(function(response){
                    if( _.isObject(response.body) ){
                        var resultsObject = response.body;

                        //if the status is OK and not an error
                        if(resultsObject.status === "OK" && Array.isArray(resultsObject.results) && resultsObject.results.length > 0){
                            var tags = new Array();
							var result = resultsObject.results[0];
							var lat = result.geometry.location.lat;
							var lon = result.geometry.location.lng;
							
							entity.longitude = lon;
							entity.latitude = lat;

                            //add any tags that the user should know (right now just the first formatted address)
                            entityResults.push({
                                entity: entity,
                                data: {
                                    entity_name:entity.value,
                                    tags: [utils.format("Lat: %d, Long: %d",lat, lon)],
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