//javascript
function initMap() {
    // Map options
    var options = {
        zoom: 5,
        center: {lat: 24.7136, lng: 46.6753}
    }

    // new map
    var map = new google.maps.Map(document.getElementById('map'), options);

    var markers = [
        {
            coords: {lat: 24.7136, lng: 46.6753},
            content: '<h1>osama</h1>'
        }
    ];

    for (var i = 0; i < markers.length; i++) {
        addMarker(markers[i]);
    }

    // Add marker function
    function addMarker(props) {
        var marker = new google.maps.Marker({
            position: props.coords,
            map: map
        });
        if (props.content) {
            // info
            var infoWindow = new google.maps.InfoWindow({
                content: props.content
            });
            marker.addListener('click', function () {
                infoWindow.open(map, marker);
            });

        }
    }
}