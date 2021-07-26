// Add console.log to check to see if our code is working.
console.log("working");

// Create the map object with center and zoom level.
//let map = L.map('mapid').setView([30, 30], 2);

// Add GeoJSON data.
let sanFranAirport =
    {"type":"FeatureCollection","features":[{
	"type":"Feature",
	"properties":{
            "id":"3469",
            "name":"San Francisco International Airport",
            "city":"San Francisco",
            "country":"United States",
            "faa":"SFO",
            "icao":"KSFO",
            "alt":"13",
            "tz-offset":"-8",
            "dst":"A",
            "tz":"America/Los_Angeles"},
        "geometry":{
            "type":"Point",
            "coordinates":[-122.375,37.61899948120117]}}
    ]};

// Accessing the airport GeoJSON URL
let dataFile = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

function createPopupHtml(feature) {
    return "<h3>Neighborhood: " + feature.properties.AREA_NAME;
}

// Grabbing our GeoJSON data.
/* L.geoJson(sanFranAirport, {
 *     // We turn each feature into a marker on the map.
 *     onEachFeature: function(feature, layer) {
 * 	layer.bindPopup(createPopupHtml(feature));
 *     }
 * }).addTo(map); */


// We create the tile layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// We create the dark view tile layer that will be an option for our map.
let sat = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// Create a base layer that holds both maps.
let baseMaps = {
    "Streets": streets,
    "Satellite": sat
};

// Create the map object with center, zoom level and default layer.
let map = L.map('mapid', {
    center: [39.5, -98.5],
    zoom: 3,
    layers: [streets]
});

// This function determines the radius of the earthquake marker based on its magnitude.
// Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
function getRadius(magnitude) {
    if (magnitude === 0) {
	return 1;
    }
    return magnitude * 4;
}

// This function determines the color of the circle based on the magnitude of the earthquake.
function getColor(magnitude) {
    if (magnitude > 5) {
	return "#ea2c2c";
    }
    if (magnitude > 4) {
	return "#ea822c";
    }
    if (magnitude > 3) {
	return "#ee9c00";
    }
    if (magnitude > 2) {
	return "#eecc00";
    }
    if (magnitude > 1) {
	return "#d4ee00";
    }
    return "#98ee00";
}

// This function returns the style data for each of the earthquakes we plot on
// the map. We pass the magnitude of the earthquake into two separate functions
// to calculate the color and radius.
function styleInfo(feature) {
    return {
	opacity: 1,
	fillOpacity: 1,
	fillColor: getColor(feature.properties.mag),
	color: "#000000",
	radius: getRadius(feature.properties.mag),
	stroke: true,
	weight: 0.5
    };
}

// Create the earthquake layer for our map.
let earthquakes = new L.layerGroup();

// We define an object that contains the overlays.
// This overlay will be visible all the time.
let overlays = {
    Earthquakes: earthquakes
};

// Then we add a control to the map that will allow the user to change
// which layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);



// Grabbing our GeoJSON data.
d3.json(dataFile).then(function(data) {
    console.log(data);
    // Creating a GeoJSON layer with the retrieved data.
    L.geoJson(data, {

	// We turn each feature into a circleMarker on the map.

	pointToLayer: function(feature, latlng) {
            console.log(data);
            return L.circleMarker(latlng);
        },
	style: styleInfo,
	// We create a popup for each circleMarker to display the magnitude and
	//  location of the earthquake after the marker has been created and styled.
	onEachFeature: function(feature, layer) {
	    layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
	}
    }).addTo(earthquakes);

    earthquakes.addTo(map);
});
