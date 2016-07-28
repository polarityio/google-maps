/**
 *     <script src='https://maps.googleapis.com/maps/api/js?v=3.exp'>
 </script>
 */
polarity.export = PolarityComponent.extend({
    map: null,
    initmap:  function() {

        if(this.get('block.isCollapsed'))
            return;

        var map = this.get('map');
        var entity = this.get('block.data.details');

        var a = entity.latitude;
        var b = entity.longitude;

        if(map === null) {

            var myOptions = {
                zoom: 10,
                scrollwheel:false,
                navigationControl: false,
                mapTypeControl: false,
                scaleControl: true,
                center: new google.maps.LatLng(a, b),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };


            map = new google.maps.Map(this.$('.geo-integration-map')[0], myOptions);
            this.set('map', map);
        }

        google.maps.event.addListenerOnce(map, 'idle', function() {
            google.maps.event.trigger(map, 'resize');
        });

    }.observes('block.isCollapsed'),
    actions: {

    }


});

