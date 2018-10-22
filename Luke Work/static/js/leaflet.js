// Flask query for data
var queryUrl = "/wines";
var wines;
// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // Once we get a response, send the data object to the createMarkers function
    console.log(data);
    createMarkers(data);
});

// starting settings for leaflet
var newYorkCoords = [40.73, -74.0059];
var parisCoords = [48.864716, 2.349014];
var brazilCoords = [-22.970722, -43.182365];
var mapZoomLevel = 5;
// Create the createMap function
function createMap(layer, coords = parisCoords, zoom = mapZoomLevel) {
    // base tile layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: "pk.eyJ1IjoiY2hyb21lZCIsImEiOiJjam10c29oaXYwaG5hM3FvMnVyaDd0eWt0In0.2LQ_9tW9cznJFz5imzGY0Q"
    });

    var piratemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.pirates",
        accessToken: "pk.eyJ1IjoiY2hyb21lZCIsImEiOiJjam10c29oaXYwaG5hM3FvMnVyaDd0eWt0In0.2LQ_9tW9cznJFz5imzGY0Q"
    });

    // Basemap option 3
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: "pk.eyJ1IjoiY2hyb21lZCIsImEiOiJjam10c29oaXYwaG5hM3FvMnVyaDd0eWt0In0.2LQ_9tW9cznJFz5imzGY0Q"
    });

    // Create a baseMaps object to hold the basemaps
    var baseMaps = {
        "Street Map": streetmap,
        "Pirate Map": piratemap,
        "Satellite Map": satellitemap
    };

    // Create the map object with options
    var myMap = L.map("map-id", {
        center: coords,
        zoom: zoom,
        layers: [streetmap, piratemap, satellitemap]
    });

    // Create an overlayMaps object to hold the wines layer
    var overlayMaps = {
        Wines: layer
    };

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

    // default the wine layer active
    layer.addTo(myMap);

    // create a legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            points = [80, 85, 90, 95, 100],
            labels = [];
        console.log(points);
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < points.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(points[i] + 1) + '"></i> ' +
                points[i] + (points[i + 1] ? '&ndash;' + points[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}

// colors for legend
function getColor(d) {
    return d > 100 ? '#0000FF' :
        d > 95 ? '#41D429' :
            d > 90 ? '#FFF300' :
                d > 85 ? '#FF8300' :
                    d > 80 ? '#FF0000' :
                        '#000000';
}

// Create the createMarkers function
function createMarkers(json) {

    // set the json file to a variable
    wines = json;

    // Initialize an array to hold bike markers
    var wineView = new PruneClusterForLeaflet();

    wineView.BuildLeafletClusterIcon = function (cluster) {
        var e = new L.Icon.MarkerCluster();

        e.stats = cluster.stats;
        e.population = cluster.population;
        return e;
    };
    // colors
    var colors = ['#FF0000', '#FF8300', '#FFF300', '#41D429', '#0000FF'];
    var pi2 = Math.PI * 2;



    L.Icon.MarkerCluster = L.Icon.extend({
        options: {
            iconSize: new L.Point(44, 44),
            className: 'prunecluster leaflet-markercluster-icon'
        },
        createIcon: function () {
            // based on L.Icon.Canvas from shramov/leaflet-plugins (BSD licence)
            var e = document.createElement('canvas');
            this._setIconStyles(e, 'icon');
            var s = this.options.iconSize;
            e.width = s.x;
            e.height = s.y;
            this.draw(e.getContext('2d'), s.x, s.y);
            return e;
        },
        createShadow: function () {
            return null;
        },
        draw: function (canvas, width, height) {
            var lol = 0;
            var start = 0;
            for (var i = 0, l = colors.length; i < l; ++i) {
                var size = this.stats[i] / this.population;
                if (size > 0) {
                    canvas.beginPath();
                    canvas.moveTo(22, 22);
                    canvas.fillStyle = colors[i];
                    var from = start + 0.14,
                        to = start + size * pi2;
                    if (to < from) {
                        from = start;
                    }
                    canvas.arc(22, 22, 22, from, to);
                    start = start + size * pi2;
                    canvas.lineTo(22, 22);
                    canvas.fill();
                    canvas.closePath();
                }
            }
            canvas.beginPath();
            canvas.fillStyle = 'white';
            canvas.arc(22, 22, 18, 0, Math.PI * 2);
            canvas.fill();
            canvas.closePath();
            canvas.fillStyle = '#555';
            canvas.textAlign = 'center';
            canvas.textBaseline = 'middle';
            canvas.font = 'bold 12px sans-serif';
            canvas.fillText(this.population, 22, 22, 40);
        }
    });




    var wineMarkers = [];

    // Loop through the wines array
    wines.forEach(wine => {
        // For each wine, create a marker
        var marker = new PruneCluster.Marker(wine.lat, wine.lon);
        marker.data.name = wine.name;
        marker.data.rating = wine.rating;
        marker.data.price = wine.price;
        wineMarkers.push(marker);
        if (wine.rating < 100) {
            marker.category = 4;
        } if (wine.rating < 95) {
            marker.category = 3;
        } if (wine.rating < 90) {
            marker.category = 2;
        } if (wine.rating < 85) {
            marker.category = 1;
        } if (wine.rating === 100) {
            marker.category = 5;
        }
        wineView.RegisterMarker(marker);
    });

    // pass the markers layer to the createMap function
    createMap(wineView);
}
