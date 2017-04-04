'use strict';

let _ = require('lodash');
let rest = require('unirest');
let async = require('async');
let util = require('util');
let log = null;

function startup(logger){
    log = logger;
}

function doLookup(entities, options, cb){
    log.trace({entities:entities, options:options}, 'Entities & Options');

    if(typeof cb !== 'function'){
        return;
    }

    if(typeof(options.apikey) !== 'string' || options.apikey.length === 0){
        cb("The API key is not set.");
        return;
    }

    let entityResults = new Array();

    //look up all of the entities that are geo codes before continuing and push them into the entityResults
    async.each(entities, function(entity, next){
        if(entity.types.indexOf('custom.latLong') >= 0 && options.lookupLatLong){
            let latLong = entity.value.split(',');
            entity.latitude = parseFloat(latLong[0]);
            entity.longitude = parseFloat(latLong[1]);

            log.trace("https://maps.googleapis.com/maps/api/geocode/json?latlng="+entity.latitude+","+entity.longitude+"&key="+options.apikey);
            //do a reverse geocoding lookup using google maps
            rest.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+entity.latitude+","+entity.longitude+"&key="+options.apikey)
                .end(function(response){
                    if( _.isObject(response.body) ){
                        let resultsObject = response.body;
                        log.trace({resultsObject: resultsObject});
                        //if the status is OK and not an error
                        if(resultsObject.status === "OK"){
                            //add any tags that the user should know (right now just the first formatted address)
                            entityResults.push({
                                entity: entity,
                                data: {
                                    summary: [resultsObject.results[0].formatted_address],
                                    details: entity
                                }
                            });
                        }
                    }
                    next();
                });
        }else if(entity.types.indexOf('custom.unitedStatesPropertyAddress') >= 0 && options.lookupAddress){
            log.trace("https://maps.googleapis.com/maps/api/geocode/json?address="+entity.value+"&key="+options.apikey);

            //do a reverse geocoding lookup using google maps
            rest.get("https://maps.googleapis.com/maps/api/geocode/json?address="+entity.value+"&key="+options.apikey)
                .end(function(response){
                    if( _.isObject(response.body) ){
                        let resultsObject = response.body;
                        log.trace({resultsObject: resultsObject});

                        //if the status is OK and not an error
                        if(resultsObject.status === "OK" && Array.isArray(resultsObject.results) && resultsObject.results.length > 0){
                            let result = resultsObject.results[0];
                            let lat = result.geometry.location.lat;
                            let lon = result.geometry.location.lng;

                            entity.longitude = lon;
                            entity.latitude = lat;

                            //add any tags that the user should know (right now just the first formatted address)
                            entityResults.push({
                                entity: entity,
                                data: {
                                    summary: [util.format("Lat: %d, Long: %d", lat, lon)],
                                    details: entity
                                }
                            });
                        }
                    }

                    next();
                });
        }else{
            next();
        }
    },function(){
        cb(null, entityResults);
    });
}

function _validateOptions(options) {
    let errors = [];

    if(typeof(options.apikey.value) !== 'string' || options.apikey.value.length === 0){
        errors.push({
            key: "apikey",
            message: "You must provide a valid Google Maps API Key"
        });
    }

    return errors;
}

function validateOptions(options, cb) {
    cb(null, _validateOptions(options));
}

module.exports = {
    doLookup: doLookup,
    startup: startup,
    validateOptions: validateOptions
};