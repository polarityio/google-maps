module.exports = {
    "name": "GoogleMaps",
    "acronym": "GM",
    "logging": {level: 'info'},
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
            "description": "Your Google Maps API Key",
            "default": "",
            "type": "text",
            "userCanEdit": true,
            "adminOnly": false
        }
    ]
};