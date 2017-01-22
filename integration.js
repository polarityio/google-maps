'use strict';
var _ = require('underscore');
var rest = require('unirest');
var async = require('async');
var utils = require('util');

var streetReg = /\d{1,9} ([^\n\r0-9,]{2,100}, ([A-Za-z ]{1,20}\d{1,9}|\d{1,3}[A-Za-z ]{1-20})[, ]?[^\n\r0-9]{2,100}[, ]?|(N |S |E |W |north |south |east |west )?\d{1,9}[^\n\r0-9 ][^\n\r0-9]{2,100}|(N |S |E |W |north |south |east |west )?\d{1,9}[^\n\r0-9, ][^\n\r0-9,]{2,100},[A-Za-z ]{1,20}\d{1,9},?[^\n\r0-9,]{2,100},?|[^\n\r0-9,]{2,100},[A-Za-z ]{1,20}\d{1,9},?[^\n\r0-9]{2,100},?|[^\n\r0-9]{2,100})[, ](AL|AK|AS|AZ|AR|CA|CO|CT|DE|DC|FM|FL|GA|GU|HI|ID|IL|IN|IA|KS|KY|LA|ME|MH|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|MP|OH|OK|OR|PW|PA|PR|RI|SC|SD|TN|TX|UT|VT|VI|VA|WA|WV|WI|WY|Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New[ ]Hampshire|New[ ]Jersey|New[ ]Mexico|New[ ]York|North[ ]Carolina|North[ ]Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode[ ]Island|South[ ]Carolina|South[ ]Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West[ ]Virginia|Wisconsin|Wyoming)[, ]+\d{5}(?:-\d{4})?/i;


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
                                    summary: [utils.format("Lat: %d, Long: %d",lat, lon)],
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
        cb(null, entityResults);
    });
};

module.exports = {
    doLookup: doLookup
};