'use strict';

//remember the script element we add so that we can remove it on apikey change
let googleMapsApiScript = null;

//load the google maps api script and add it to the head
let initMaps = function(integration, userConfig, userOptions) {
  //remove and already existing script tag
  if (googleMapsApiScript !== null) {
    document.getElementsByTagName('head')[0].removeChild(googleMapsApiScript);
  }

  if (typeof userOptions.apikey !== 'undefined' && userOptions.apikey.length > 0) {
    //add the google map script element to the head of the document
    let script = document.createElement('script');
    script.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=' + userOptions.apikey);
    document.getElementsByTagName('head')[0].appendChild(script);

    //remember the element
    googleMapsApiScript = script;
  }
};

// onSettingsChange is called once when the integration loads and then
// anytime the settings are changed
onSettingsChange(initMaps);
