'use strict';

//load the google maps api script and add it to the head
let initMaps = function (integration, userConfig, userOptions) {
  const MAPS_DATA_KEY = 'https://maps.googleapis.com/maps/api/js'

  // This returns the library we inject
  const mapApiElement = document.querySelector(`script[data="${MAPS_DATA_KEY}"]`);
  const mapsSrcWithKey = `https://maps.googleapis.com/maps/api/js?key=${userOptions.apikey}`;

  const insertApi = () => {
    const mapsScript = document.createElement('script');
    mapsScript.setAttribute('src', mapsSrcWithKey);
    mapsScript.setAttribute('data', MAPS_DATA_KEY);
    mapsScript.setAttribute('key', userOptions.apikey);
    document.getElementsByTagName('head')[0].appendChild(mapsScript);
  }

  // Maps API has not been loaded before so load it for the first time
  if (!mapApiElement) {
    insertApi();
  } else {
    // map has been loaded before, check if API key is different and if so, remove the scripts
    const existingApiKey = mapApiElement.getAttribute('key');

    if (existingApiKey !== userOptions.apikey) {
      // The API key is different so reload everything
      // Google automatically injects additional map libraries as part of the v3
      // google maps api so we need to find those and remove them all
      const mapApiElements = document.querySelectorAll(`script[src^="https://maps.googleapis.com"]`);
      mapApiElements.forEach(element => {
        element.parentElement.removeChild(element);
      });
      // Remove the global google references so we don't get the warning from google that we've tried to
      // load the library multiple times.
      if(google && google.maps){
        delete google.maps;
      }

      insertApi();
    }
  }
};

// onSettingsChange is called once when the integration loads and then
// anytime the settings are changed
onSettingsChange(initMaps);
