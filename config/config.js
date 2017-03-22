module.exports = {
    "name": "GoogleMaps",
    "acronym": "GM",
    "logging": {level: 'debug'},
    //"styles": [
      //  "./styles/googlemaps.less"
    //],
    "block": {
        "component": {
            "file": "./components/block.js"
        },
        "template": {
            "file": "./template/block.hbs"
        }
    },
    "javascript": [
        "./javascript/vendor.js"
    ],
    "options": [
        {
            "key": "apikey",
            "name": "API Key",
            "description": "This is a description",
            "default": "",
            "type": "text",
            "userCanEdit": true,
            "adminOnly": false
        }
    ]
};