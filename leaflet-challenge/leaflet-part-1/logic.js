// GeoJSON URL data
const earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the data and plot
d3.json(earthquakeURL).then(function(data) {
    plotEarthquakes(data);
});

// Create map (coordinates to center of US)
const map = L.map("map").setView([37.09, -95.71], 4); 

// Add tile layer (openstreetmap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
}).addTo(map);

// Plot data as markers (size based on magnitude)
function plotEarthquakes(data) {
    function markerSize(magnitude) {
        return magnitude * 4; 
    }

// determine marker color based on depth
    function getColor(depth) {
        return depth > 90 ? "#ff0000" : //red
               depth > 70 ? "#ff8000" : //orange
               depth > 50 ? "#ffbf00" : //light orange
               depth > 30 ? "#ffff00" : //yellow
               depth > 10 ? "#bfff00" : //light green
                            "#00ff00" ; //green
    }

// Add GeoJSON layer to map
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]), // Depth as third coordinate
                color: "#000",
                weight: 0.5,
                fillOpacity: 0.75,
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(
                `Magnitude: ${feature.properties.mag}<br>
                 Location: ${feature.properties.place}<br>
                 Depth: ${feature.geometry.coordinates[2]} km`
            );
        },
    }).addTo(map);
}

// Add a legend to the map
const legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    const div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70, 90];
    const colors = ["#00ff00", "#bfff00", "#ffff00", "#ffbf00", "#ff8000", "#ff0000"];

    div.innerHTML += "<h4>Depth (km)</h4>";

    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' +
            depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
    }

    return div;
};

legend.addTo(map);