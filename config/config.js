module.exports = {
    "name": "Google Maps",
    "acronym": "GM",
    "entityTypes": ["geo", "string"],
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