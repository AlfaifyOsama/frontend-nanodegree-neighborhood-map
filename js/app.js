// declaring global variables
var map, infoWindow, bounds;

/* Model Data */
var locations = [
    {
        title: 'Nakheel Tower',
        location: {
            lat: 24.7488774,
            lng: 46.65273419999994
        }
    },
    {
        title: 'Kingdom Centre',
        location: {
            lat: 24.7114,
            lng:  46.6744
        }
    },
    {
        title: 'KAFD World Trade Center',
        location: {
            lat: 24.76195599999999,
            lng: 46.64043370000002
        }
    },
    {
        title: 'Al Faisaliyah Center',
        location: {
            lat: 24.6905765,
            lng: 46.6850970
        }
    },
    {
        title: 'Burj Rafal',
        location: {
            lat: 24.7925009,
            lng: 46.632335799999964
        }
    }
];

// google maps init
function initMap() {
    var Riyadh = {
        lat: 24.7136,
        lng: 46.6753
    };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: Riyadh
    });

    infoWindow = new google.maps.InfoWindow();

    bounds = new google.maps.LatLngBounds();

    ko.applyBindings(new ViewModel());
}

// handle map error
function googleMapsError() {
    alert('An error occurred with Google Maps!');
}

/* Location Model */
var LocationMarker = function(data) {
    var self = this;

    this.title = data.title;
    this.position = data.location;
    this.visible = ko.observable(true);

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('6C6B6B');

    //  Change color when the user hover the marker.
    var changeColor = makeMarkerIcon('007BFF');

    // Create a marker per location, and put into markers array
    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon
    });
    // set marker and extend bounds (showListings)
    self.filterMarkers = ko.computed(function () {
        if(self.visible() === true) {
            self.marker.setMap(map);
            bounds.extend(self.marker.position);
            map.fitBounds(bounds);
        } else {
            self.marker.setMap(null);
        }
    });

    // Make an onclick even to open an indowindow at each marker
    this.marker.addListener('click', function() {
        populateInfoWindow(this, self.street, self.city, self.phone, infoWindow);
        toggleBounce(this);
        map.panTo(this.getPosition());
    });

    // Two event listeners - one for mouseover and another for mouseout to change the colors back.
    this.marker.addListener('mouseover', function() {
        this.setIcon(changeColor);
    });
    this.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });

    // show item info when selected from list
    this.show = function(location) {
        google.maps.event.trigger(self.marker, 'click');
    };

    // creates bounce effect when item selected
    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

/* View Model */
var ViewModel = function() {
    var self = this;

    this.searchItem = ko.observable('');

    this.mapList = ko.observableArray([]);

    // add location markers for each location
    locations.forEach(function(location) {
        self.mapList.push( new LocationMarker(location) );
    });

    // locations viewed on map
    this.locationList = ko.computed(function() {
        var searchFilter = self.searchItem().toLowerCase();
        if (searchFilter) {
            return ko.utils.arrayFilter(self.mapList(), function(location) {
                var str = location.title.toLowerCase();
                var result = str.includes(searchFilter);
                location.visible(result);
                return result;
            });
        }
        self.mapList().forEach(function(location) {
            location.visible(true);
        });
        return self.mapList();
    }, self);
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based on that markers position.
function populateInfoWindow(marker, street, city, phone, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 40;

        var windowContent = '<h4>' + marker.title + '</h4>' +
            '<p>' + street + "<br>" + city + '<br>' + phone + "</p>";

        //if the status is OK, which means the pano was found, compute the
        // position of the street view image, then calculate the heading, then get a
        // panorama from that and set the options.
        var getStreetView = function (data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent(windowContent + '<div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent(windowContent + '<div style="color: red">No Street View Found</div>');
            }
        };
        // Use street view service to get the closest street view image with radius 50.
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}
