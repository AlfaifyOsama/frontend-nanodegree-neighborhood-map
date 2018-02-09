var map;

// class to instantiate all of the places
function place(name, coordin, img, visible, catagory) {

    this.name = ko.observable(name);
    this.coordin = ko.observable(coordin);
    this.img = ko.observable(img);
    this.visible = ko.observable(visible);
    // google maps marker
    this.markerObject = null;
}


function viewModel() {

    // Smart array of all the places
    this.places = ko.observableArray([
        new place(
            "King Saud University", {
                lat: 24.7224,
                lng: 46.6271
            },
            "img/Ksu.jpg",
            true,
            "University"),
        new place(
            "Kingdom Centre", {
                lat: 24.7111837,
                lng: 46.67340100000001
            },
            "img/Kingdom_Center_.jpg",
            true,
            "mall hotel office"),
        new place(
            "KAFD World Trade Center", {
                lat: 24.76195599999999,
                lng: 46.64043370000002
            },
            "img/1stGrade-Panora Park- Financial Plaza (22)PhotoGala.jpg",
            true,
            "mall hotel offices office company"),
        new place(
            "Al Faisaliyah Center", {
                lat: 24.6905765,
                lng: 46.68509700000004
            },
            "img/faisaleh.jpg",
            true,
            "mall hotel office"),
        new place(
            "Royal commission", {
                lat: 24.684340,
                lng: 46.637900
            },
            "img/Royal.jpg",
            true,
            "offices company")
    ]);

    // getting the input from the input box
    this.filterString = ko.observable('');

    this.submit = function () {
        var filterString = this.filterString();
        for (var i = 0; i < this.places().length; i++) {
            var name = this.places()[i].name();
            this.places()[i].visible((name.indexOf(filterString) >= 0 ) ? true : false);
        }
        //doing/undoing based on marker visible value
        undoMarker(filterString);
        infoWindow.close();
    };

    this.listClick = function (location) {
        //loop in the markers array to match marker with location
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].loc == location) {
                markers[i].setAnimation(4);
                popUpInfoWindow(location);
            }
        }
    };

}


// erasing markers once filtered
function undoMarker(filterString) {
    for (var i = 0; i < markers.length; i++) {
        var name = markers[i].loc.name();
        if (name.indexOf(filterString) >= 0) {
            markers[i].setVisible(true);
        } else {
            markers[i].setVisible(false);
        }
    }
}

//knockout binding with index.html
ko.applyBindings(new viewModel());

// google map error function
function mapError() {
    alert('Google Maps is temporarily unavailable. Try again later');
}

var markers = [];
var vm = ko.dataFor(document.body);


function initMap() {
    infoWindow = new google.maps.InfoWindow({
        content: 'emptyStringHypothatically'
    });
    var mapElemnt = document.getElementById('map');
    var uluru = {
        lat: 24.7224,
        lng: 46.6271
    };
    //set where we want the map to be
    map = new google.maps.Map(mapElemnt, {
        center: uluru,
        zoom: 12,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    });
    //creating markers for every place
    for (var i = 0; i < vm.places().length; i++) {
        var loc = vm.places()[i];
        var marker = new google.maps.Marker({
            position: loc.coordin(),
            map: map,
            loc: loc,
            animation: null
        });
        loc.markerObject = marker;
        marker.addListener('click', onClickMarker); // when a marker is clicked run the function that animates
        markers.push(marker);
    }

}

// a function that animates what happens when a marker is clicked
function onClickMarker() {
    this.setAnimation(4);
    popUpInfoWindow(this.loc);
}

var infoWindow = null;

function popUpInfoWindow(loc) {
    var name = loc.name();
    var img = loc.img();

    infoWindow.close();
    // in case of WIKI API error
    var wikiError = setTimeout(function () {
        //error message
        infoWindow.setContent("<p>ERROR !! wiki content out of service</p>");
        infoWindow.open(map, loc.markerObject);
    }, 5000);

    // wiki API
    $.ajax({
        dataType: "jsonp",
        url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles="+name,
        success: function (data) {
            var Article = data.query.pages;
            // we need articles first key so
            for (var firstKey in Article)
                break;
            // to get the first paragraph of the Article
            var extract = Article[firstKey].extract;
            //display the paragraph above a marker
            infoWindow.setContent('<div class="info"><div class="info-text"><p class="title">' + name + '</p><p class="address">' + extract + '</p></div><div class="bus-img"><img src="' + img + '" alt="place img"></div>');
            infoWindow.open(map, loc.markerObject);
            clearTimeout(wikiError);
        }
    });
} //end popup
