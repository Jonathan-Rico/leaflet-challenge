// Creating the tile layer that will be the background of our map.
var basemap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
  {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });


//Creating the map object with options.
var map = L.map("map", {
  center: [38.7, -118.5],
  zoom: 5
});

// Adding our 'basemap' tile layer to the map.
basemap.addTo(map);

// Here we make a call that retrieves the earthquake geoJSON data using D3.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
  console.log(data.features)


//Style function that sets the size and color for earthquakes in map (calls in getColor function and circleRadius function below)
  function styleInfo(features) {
    return {
      opacity: 0.3,
      fillOpacity: .8,
      fillColor: getColor(features.geometry.coordinates[2]),
      color: "#000000",
      radius: circleRadius(features.properties.mag),
    };
  }

  // Function to determine the color of the marker based on the magnitude of the earthquake.
  function getColor(earthquake_depth) {
    switch (true) {
      case earthquake_depth > 90:
        return "#ea2c2c";
      case earthquake_depth > 70:
        return "#ea822c";
      case earthquake_depth > 50:
        return "#ee9c00";
      case earthquake_depth > 30:
        return "#eecc00";
      case earthquake_depth > 10:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }

  // Function to determine the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 are given a minimum value to prevent plotting them in the map.
  function circleRadius(earthquake_magnitude) {
    if (earthquake_magnitude <= 0) {
      return 1;
    }
    else {
    return earthquake_magnitude * 5;
    }
  }

  // Adding a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turning each feature into a circleMarker on the map.
    pointToLayer: function (features, latlng) {return L.circleMarker(latlng);},
    // Setting the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Adding popups for each marker to display the magnitude and location of each earthquake after the marker has been created and styled
    onEachFeature: function (features, layer) {
      layer.bindPopup(
        "Magnitude: " + features.properties.mag
        + "<br>Depth in KM: " + features.geometry.coordinates[2]
        + "<br>Location Details: " + features.properties.place
      );
    }
  }).addTo(map);

  // Creating a legend control object.
  var legend = L.control({position: "bottomright"});

  // Adding all the details for the legend
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "legend")
    var depths = [-10, 10, 30, 50, 70, 90];
    var colors = ["#F0FF00","#D4FF00","#AAFF00","#FF9300","#FF8300","#FF2A00"];
    div.innerHTML += "<h3>Depth in KM<h3>"
    // Looping through the depth intervals to generate a label with a colored square for each interval.
    for (var x = 0; x < depths.length; x++) {
      div.innerHTML += "<i style='background: " + colors[x] + "'></i> "
        + depths[x] + (depths[x + 1] ? "&ndash;" + depths[x + 1] + "<br>" : "+");
    }
    
    return div;
  };

  // Finally, we our legend to the map.
  legend.addTo(map);
});
