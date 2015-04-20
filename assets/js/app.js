var map, featureList, boroughSearch = [], theaterSearch = [], stationSearch = [];


$(window).resize(function () {
    sizeLayerControl();
});

$(document).on("click", ".feature-row", function (e) {
    $(document).off("mouseout", ".feature-row", clearHighlight);
    sidebarClick(parseInt($(this).attr("id"), 10));
});


$(document).on("mouseover", ".feature-row", function (e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
});

$(document).on("mouseout", ".feature-row", clearHighlight);

//$("#about-btn").click(function() {
//  $("#aboutModal").modal("show");
//  $(".navbar-collapse.in").collapse("hide");
//  return false;
//});
//
//$("#full-extent-btn").click(function() {
//  map.fitBounds(boroughs.getBounds());
//  $(".navbar-collapse.in").collapse("hide");
//  return false;
//});
//
//$("#legend-btn").click(function() {
//  $("#legendModal").modal("show");
//  $(".navbar-collapse.in").collapse("hide");
//  return false;
//});
//
//$("#login-btn").click(function() {
//  $("#loginModal").modal("show");
//  $(".navbar-collapse.in").collapse("hide");
//  return false;
//});

$("#list-btn").click(function () {
    $('#sidebar').toggle();
    map.invalidateSize();
    return false;
});

//$("#nav-btn").click(function() {
//  $(".navbar-collapse").collapse("toggle");
//  return false;
//});
//
//$("#sidebar-toggle-btn").click(function() {
//  $("#sidebar").toggle();
//  map.invalidateSize();
//  return false;
//});
//
//$("#sidebar-hide-btn").click(function() {
//  $('#sidebar').hide();
//  map.invalidateSize();
//});

function sizeLayerControl() {
    $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
    highlight.clearLayers();
}

function sidebarClick(id) {
    var layer = stations.getLayer(id);
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
    layer.fire("click");
    /* Hide sidebar and go to the map on small screens */
    if (document.body.clientWidth <= 767) {
        $("#sidebar").hide();
        map.invalidateSize();
    }
}

function syncSidebar() {
    /* Empty sidebar features */
    $("#feature-list tbody").empty();
    /* Loop through stations layer and add only features which are in the map bounds */
    stations.eachLayer(function (layer) {
        if (map.hasLayer(stations)) {
            if (map.getBounds().contains(layer.getLatLng())) {
                $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"></td><td class="feature-name">' + layer.feature.properties.sta_name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
            }
        }
    });

    /* Update list.js featureList */
    featureList = new List("features", {
        valueNames: ["feature-name"]
    });
    featureList.sort("feature-name", {
        order: "asc"
    });
}

/* Basemap Layers */

var Esri_OceanBasemap = L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
    maxZoom: 14
});


/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
    stroke: false,
    fillColor: "#5EE060",
    fillOpacity: 0.7,
    radius: 15
};

var boroughs = L.geoJson(null, {
    style: function (feature) {
        return {
            stroke: false,
            //color: "black",
            fill: false,
            opacity: 1,
            clickable: false
        };
    },
    onEachFeature: function (feature, layer) {
        boroughSearch.push({
            name: layer.feature.properties.BoroName,
            source: "Boroughs",
            id: L.stamp(layer),
            bounds: layer.getBounds()
        });
    }
});
$.getJSON("data/boroughs.geojson", function (data) {
    boroughs.addData(data);
});







var stations = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            title: feature.properties.sta_name,
            icon: L.MakiMarkers.icon({
                icon: "chemist",
                color: "#09962F",
                size: "s"
            })
        })
            .addTo(map)
    },

    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Station Name</th><td>" + feature.properties.sta_name + "</td></tr>" + "<tr><th>Station Type</th><td>" + feature.properties.sta_type + "</td></tr>" + "<tr><th>Station Id</th><td>" + feature.properties.sta_id + "<table>";
            layer.on({
                click: function (e) {
                    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 14);
                    map.invalidateSize();
                    $("#sidebar-right").show()
                    $("#feature-title").html(feature.properties.sta_name);
                    $("#feature-info").html(content);

                    //$("#featureModal").modal("show");
                    highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
                }
            });
            $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"></td><td class="feature-name">' + layer.feature.properties.sta_name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
            stationSearch.push({
                name: layer.feature.properties.sta_name,
                address: layer.feature.properties.sta_id,
                source: "Stations",
                id: L.stamp(layer),
                lat: layer.feature.geometry.coordinates[1],
                lng: layer.feature.geometry.coordinates[0]
            });
        }
    }
});
$.getJSON("data/monitor_stations.geojson", function (data) {
    stations.addData(data);
    map.addLayer(stations);
});


map = L.map("map", {
    zoom: 10,
    center: [41.7672146942102, -70.3509521484375],
    layers: [Esri_OceanBasemap, boroughs, highlight],
    zoomControl: false,
    attributionControl: false
});

L.control.navbar().addTo(map);

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
    syncSidebar();
});


map.on('zoomend', function () {
if (map.getZoom() ==10) {
    $("#sidebar-right").hide();
    map.invalidateSize();
}
});

/* Clear feature highlight when map is clicked */
map.on("click", function (e) {
    highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
    $.each(map._layers, function (index, layer) {
        if (layer.getAttribution) {
            $("#attribution").html((layer.getAttribution()));
        }
    });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
    position: "bottomright"
});
attributionControl.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-control-attribution");
    div.innerHTML = "<span class='hidden-xs'>BootLeaf developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a></span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'></a>";
    return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
    position: "topleft"
}).addTo(map);


/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
    var isCollapsed = true;
} else {
    var isCollapsed = false;
}


/* Highlight search box text on click */
$("#searchbox").click(function () {
    $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
    if (e.which == 13) {
        e.preventDefault();
    }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
    $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
    $("#loading").hide();
    sizeLayerControl();
    /* Fit map to boroughs bounds */
    map.fitBounds(boroughs.getBounds());
    featureList = new List("features", {valueNames: ["feature-name"]});
    featureList.sort("feature-name", {order: "asc"});


    var stationsBH = new Bloodhound({
        name: "Stations",
        datumTokenizer: function (d) {
            return Bloodhound.tokenizers.whitespace(d.sta_name);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: stationSearch,
        limit: 10
    });


    stationsBH.initialize();


    /* instantiate the typeahead UI */
    $("#searchbox").typeahead({
        minLength: 3,
        highlight: true,
        hint: false
    }, {
        name: "Stations",
        displayKey: "name",
        source: stationsBH.ttAdapter(),
        templates: {
            header: "<h4 class='typeahead-header'>Boroughs</h4>"
        }
    }).on("typeahead:selected", function (obj, datum) {
        if (datum.source === "Boroughs") {
            map.fitBounds(datum.bounds);
        }
        if (datum.source === "Stations") {
            if (!map.hasLayer(stations)) {
                map.addLayer(stations);
            }
            map.setView([datum.lat, datum.lng], 14);
            if (map._layers[datum.id]) {
                map._layers[datum.id].fire("click");
            }
        }

        if ($(".navbar-collapse").height() > 50) {
            $(".navbar-collapse").collapse("hide");
        }
    }).on("typeahead:opened", function () {
        $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
        $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
    }).on("typeahead:closed", function () {
        $(".navbar-collapse.in").css("max-height", "");
        $(".navbar-collapse.in").css("height", "");
    });
    $(".twitter-typeahead").css("position", "static");
    $(".twitter-typeahead").css("display", "block");


});


// Leaflet patch to make layer control scrollable on touch browsers
//var container = $(".leaflet-control-layers")[0];
//if (!L.Browser.touch) {
//  L.DomEvent
//  .disableClickPropagation(container)
//  .disableScrollPropagation(container);
//} else {
//  L.DomEvent.disableClickPropagation(container);
//}
