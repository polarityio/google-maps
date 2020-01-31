'use strict';

const _ = require('lodash');
const request = require('request');
const fs = require('fs');
const config = require('./config/config');
const async = require('async');
const util = require('util');

const BASE_URI = 'https://maps.googleapis.com/maps/api/geocode/json';

let log = null;
let requestWithDefaults;

function startup(logger) {
  log = logger;
  let defaults = {};

  if (typeof config.request.cert === 'string' && config.request.cert.length > 0) {
    defaults.cert = fs.readFileSync(config.request.cert);
  }

  if (typeof config.request.key === 'string' && config.request.key.length > 0) {
    defaults.key = fs.readFileSync(config.request.key);
  }

  if (typeof config.request.passphrase === 'string' && config.request.passphrase.length > 0) {
    defaults.passphrase = config.request.passphrase;
  }

  if (typeof config.request.ca === 'string' && config.request.ca.length > 0) {
    defaults.ca = fs.readFileSync(config.request.ca);
  }

  if (typeof config.request.proxy === 'string' && config.request.proxy.length > 0) {
    defaults.proxy = config.request.proxy;
  }

  requestWithDefaults = request.defaults(defaults);
}

function doLookup(entities, options, cb) {
  log.trace({ entities, options }, 'Entities & Options');
  let lookupResults = [];

  // look up all of the entities that are geo codes before continuing and push them into the lookupResults
  async.each(
    entities,
    function(entity, next) {
      if (entity.types.indexOf('custom.latLong') >= 0) {
        const latLong = entity.value.split(',');
        entity.latitude = parseFloat(latLong[0]);
        entity.longitude = parseFloat(latLong[1]);

        const requestOptions = {
          uri:
            BASE_URI +
            '?latlng=' +
            entity.latitude +
            ',' +
            entity.longitude +
            '&key=' +
            options.apikey,
          method: 'GET',
          json: true
        };

        log.trace(requestOptions.uri);

        // do a reverse geocoding lookup using google maps
        requestWithDefaults(requestOptions, (err, response, body) => {
          if (err) return next({ err, detail: 'HTTP Request Error in Latitude/Longitude Request' });
          if (body.status === 'OVER_QUERY_LIMIT') {
            return next({
              err: body.status,
              httpStatus: response.statusCode,
              body,
              detail: body.error_message,
              entity: entity.value
            });
          }

          if (_.isObject(body)) {
            log.trace({ body });

            // if the status is OK and not an error
            if (body.status === 'OK') {
              // add any tags that the user should know (right now just the first formatted address)
              lookupResults.push({
                entity,
                data: {
                  summary: [body.results[0].formatted_address],
                  details: entity
                }
              });
            }
          }
          next();
        });
      } else if (entity.types.indexOf('custom.unitedStatesPropertyAddress') >= 0) {
        const requestOptions = {
          uri: `${BASE_URI}?address=${entity.value}&key=${options.apikey}`,
          method: 'GET',
          json: true
        };

        log.trace(requestOptions.uri);

        // do a reverse geocoding lookup using google maps
        requestWithDefaults(requestOptions, (err, response, body) => {
          if (err) return next({ err, detail: 'HTTP Request Error in Address Request' });
          if (body.status === 'OVER_QUERY_LIMIT') {
            return next({
              err: body.status,
              httpStatus: response.statusCode,
              body,
              detail: body.error_message,
              entity: entity.value
            });
          }
          if (_.isObject(body)) {
            log.trace({ body });

            // if the status is OK and not an error
            if (body.status === 'OK' && Array.isArray(body.results) && body.results.length > 0) {
              const result = body.results[0];
              const lat = result.geometry.location.lat;
              const lon = result.geometry.location.lng;

              entity.longitude = lon;
              entity.latitude = lat;

              entity.value = util.format('Lat: %d, Long: %d', lat, lon);

              // add any tags that the user should know (right now just the first formatted address)
              lookupResults.push({
                entity,
                displayValue: body.results[0].formatted_address,
                data: {
                  summary: [entity.value],
                  details: entity
                }
              });
            }
          }
          next();
        });
      } else {
        next();
      }
    },
    (err) => {
      log.trace({ lookupResults }, 'Returning lookup results to client');
      cb(err, lookupResults);
    }
  );
}

function _validateOptions(options) {
  let errors = [];

  if (typeof options.apikey.value !== 'string' || options.apikey.value.length === 0) {
    errors.push({
      key: 'apikey',
      message: 'You must provide a valid Google Maps API Key'
    });
  }

  return errors;
}

function validateOptions(options, cb) {
  cb(null, _validateOptions(options));
}

module.exports = {
  doLookup,
  startup,
  validateOptions
};
