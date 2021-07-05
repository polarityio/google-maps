'use strict';

polarity.export = PolarityComponent.extend({
  map: null,
  mapListener: null,
  init: function () {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, this.initializeMap);
  },
  initializeMap() {
    let entity = this.get('block.data.details');
    if (this.map === null) {
      const options = this.get('block._options');
      let myOptions = {
        scrollwheel: false,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: true,
        center: options && options.latlng ? options.latlng : new google.maps.LatLng(entity.latitude, entity.longitude),
        zoom: options && options.zoom ? options.zoom : 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.$('.geo-integration-map')[0], myOptions);
      this.mapListener = google.maps.event.addListenerOnce(this.map, 'idle', () => {
        google.maps.event.trigger(this.map, 'resize');
        this.map.setCenter(options && options.latlng ? options.latlng : new google.maps.LatLng(entity.latitude, entity.longitude));
      });
    }
  },
  /**
   * Saves the current lat, lng, and zoom position of the map so it can restored if the user closes and then re-opens
   * the details block for this map.  Note that this logic does not currently save the map type (e.g., if the user
   * is in street view).
   *
   * This logic does not also save the map state if the user reruns the search (e.g., via the magnifying glass)
   */
  saveMapOptions: function () {
    const center = this.map.getCenter();
    let options = {
      latlng: {
        lat: center.lat(),
        lng: center.lng()
      },
      zoom: this.map.getZoom()
    };
    this.set('block._options', options);
  },
  /**
   * Ensure the MapListener is destroyed if we destroy the details block component
   */
  willDestroyElement() {
    if (this.mapListener) {
      this.saveMapOptions();
      google.maps.event.removeListener(this.mapListener);
    }
  }
});
