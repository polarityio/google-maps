/*
 * Copyright (c) 2017. Breach Intelligence, Inc.
 * All rights reserved
 */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let nock = require('nock');
let integration = require('../integration');

describe('doLookup()', function () {
    before(function (done) {
        integration.startup({
            trace: function (msg) {
                //console.info(JSON.stringify(msg, null, 4));
            }
        });

        nock('https://maps.googleapis.com')
            .get('/maps/api/geocode/json')
            .query({
                latlng: '38.88,-77',
                key: 'aaa'
            })
            .reply(200, {
                results: [
                    {
                        formatted_address: "Southeast Fwy, Washington, DC 20003, USA",
                    }
                ],
                status: "OK"
            });

        nock('https://maps.googleapis.com')
            .get('/maps/api/geocode/json')
            .query({
                address: 'Southeast Fwy, Washington, DC 20003, USA',
                key: 'aaa'
            })
            .reply(200, {
                results: [
                    {
                        geometry: {
                            "location": {
                                "lat": 38.8796322,
                                "lng": -76.9990365
                            }
                        }
                    }
                ],
                status: "OK"
            });
        done();
    });

    it('should convert latLong entity to address', function (done) {
        integration.doLookup([{
            type: 'custom',
            types: ['custom.latLong'],
            value: '38.88,-77.00'
        }], {
            apikey: 'aaa',
            lookupLatLong: true,
            lookupAddress: true
        }, function (err, result) {
            //console.info(JSON.stringify(result, null, 4));
            expect(err).to.be.null;
            let entity = {
                type: 'custom',
                types: ['custom.latLong'],
                value: '38.88,-77.00',
                latitude: 38.88,
                longitude: -77.00
            };

            expect(result).to.deep.equal([
                    {
                        entity: entity,
                        data: {
                            summary: ["Southeast Fwy, Washington, DC 20003, USA"],
                            details: entity
                        }
                    }
                ]
            );
            done();
        });
    });

    it('should not lookup lat long if "lookupLatLong" is false', function (done) {
        integration.doLookup([{
            type: 'custom',
            types: ['custom.latLong'],
            value: '38.88,-77.00'
        }], {
            apikey: 'aaa',
            lookupLatLong: false,
            lookupAddress: true
        }, function (err, result) {
            //console.info(JSON.stringify(result, null, 4));
            expect(err).to.be.null;
            expect(result).to.deep.equal([]);
            done();
        });
    });

    it('should convert address to latlong', function (done) {
        integration.doLookup([{
            type: 'custom',
            types: ['custom.unitedStatesPropertyAddress'],
            value: 'Southeast Fwy, Washington, DC 20003, USA'
        }], {
            apikey: 'aaa',
            lookupLatLong: true,
            lookupAddress: true
        }, function (err, result) {
            //console.info(JSON.stringify(result, null, 4));
            expect(err).to.be.null;
            let entity = {
                type: 'custom',
                types: ['custom.unitedStatesPropertyAddress'],
                value: 'Southeast Fwy, Washington, DC 20003, USA',
                latitude: 38.8796322,
                longitude: -76.9990365
            };

            expect(result).to.deep.equal([
                    {
                        entity: entity,
                        data: {
                            summary: [ "Lat: 38.8796322, Long: -76.9990365"],
                            details: entity
                        }
                    }
                ]
            );
            done();
        });
    });

    it('should not lookup address if "lookupAddress" is false', function (done) {
        integration.doLookup([{
            type: 'custom',
            types: ['custom.unitedStatesPropertyAddress'],
            value: 'Southeast Fwy, Washington, DC 20003, USA'
        }], {
            apikey: 'aaa',
            lookupLatLong: true,
            lookupAddress: false
        }, function (err, result) {
            //console.info(JSON.stringify(result, null, 4));
            expect(err).to.be.null;
            expect(result).to.deep.equal([]);
            done();
        });
    });

    it('should not do lookup if there is a type mismatch', function (done) {
        integration.doLookup([{
            type: 'custom',
            types: ['custom.notreal'],
            value: 'test'
        }], {
            apikey: 'aaa',
            lookupLatLong: false,
            lookupAddress: true
        }, function (err, result) {
            //console.info(JSON.stringify(result, null, 4));
            expect(err).to.be.null;
            expect(result).to.deep.equal([]);
            done();
        });
    });
});
