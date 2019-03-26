"use strict";

polarity.export = PolarityComponent.extend({
  map: null,
  blockCollapseChanged: Ember.computed("block.isCollapsed", function() {
    if (this.get("block.isCollapsed")) {
      return;
    }

    Ember.run.scheduleOnce("afterRender", this, function() {
      var map = this.get("map");
      var entity = this.get("block.data.details");

      if (map === null) {
        var myOptions = {
          scrollwheel: false,
          navigationControl: false,
          mapTypeControl: false,
          scaleControl: true,
          center: new google.maps.LatLng(entity.latitude, entity.longitude),
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(this.$(".geo-integration-map")[0], myOptions);
        this.set("map", map);
      }

      google.maps.event.addListenerOnce(map, "idle", function() {
        google.maps.event.trigger(map, "resize");
        map.setCenter(
          new google.maps.LatLng(entity.latitude, entity.longitude)
        );
      });
    });
  })
});
