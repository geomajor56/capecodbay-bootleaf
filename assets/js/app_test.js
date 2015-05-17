var map, featureList, stationSearch = [], station_num_id;


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


$("#list-btn").click(function () {
    $('#sidebar').toggle();
    map.invalidateSize();
    return false;
});

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
                $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"></td><td class="feature-name">' + layer.feature.properties.station_name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
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
            var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Station Name</th><td>" + feature.properties.station_name + "</td></tr>" + "<tr><th>Station Type</th><td>" + feature.properties.station_type + "</td></tr>" + "<tr><th>Station Id</th><td>" + feature.properties.station_id + "<table>";
            layer.on({
                click: function (e) {
                    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 14);
                    map.invalidateSize();
//                    console.log(feature.properties.station_id)
                    var this_station = feature.properties.station_id.toString()
  //                  console.log(typeof(this_station));

var temperature = [], salinity = [], dissolved_oxygen = [], ph = [], nitrogen = [], phosphates = [], ammonium = [], silicates = [], total_nitrogen = [], total_phosphorus = [], chlorophyll = [], pheophytin = [], turbidity = [];

                    $.ajax({
                        type: "POST",
                        url: "assets/php/get_station_data.php",
                        data: {
                            "station_num_id": this_station
                        },
                        dataType: 'json',
                        error: function (xhr, ajaxOptions, thrownError) {
                            alert(xhr.status);
                            alert(thrownError);
                        },
                        success: function chartParser(data) {
                            //console.log(data.length)
                            var sampleDate, d, sampleYear;
                            $('#map-content').hide();
                            $('#chart-content').show();
                            // console.log(data);
                            for (var i = 0; i < data.length; i++) {
                                sampleDate = data[i][1];   // in milliseconds for Highcharts
                                d = new Date(data[i][1]);
                                sampleYear = d.getFullYear();
                                temperature.push([sampleDate, data[i][3]]);
                                salinity.push([sampleDate, data[i][4]]);
                                dissolved_oxygen.push([sampleDate, data[i][5]]);
                                ph.push([sampleDate, data[i][6]]);
                                chlorophyll.push([sampleDate, data[i][7]]);
                                pheophytin.push([sampleDate, data[i][8]]);
                                turbidity.push([sampleDate, data[i][9]]);
                                nitrogen.push([sampleDate, data[i][10]]);
                                ammonium.push([sampleDate, data[i][11]]);
                                phosphates.push([sampleDate, data[i][12]]);
                                silicates.push([sampleDate, data[i][13]]);
                                total_nitrogen.push([sampleDate, data[i][14]]);
                                total_phosphorus.push([sampleDate, data[i][15]]);
        //                        console.log(total_phosphorus);
                            }
                        }

                    });



                    $("#sidebar-right").show()
                    //$("#feature-title").html(feature.properties.station_name);
                    //$("#feature-info").html(content);

                    //$("#featureModal").modal("show");
                    highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
                }
            });
            $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"></td><td class="feature-name">' + layer.feature.properties.station_name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
            stationSearch.push({
                name: layer.feature.properties.station_name,
                address: layer.feature.properties.station_id,
                source: "Stations",
                id: L.stamp(layer),
                lat: layer.feature.geometry.coordinates[1],
                lng: layer.feature.geometry.coordinates[0]
            });
        }
    }
});
$.getJSON('assets/php/get_stations.php', function (data) {
    stations.addData(data);
    map.addLayer(stations);
});


map = L.map("map", {
    zoom: 10,
    center: [41.7672146942102, -70.3509521484375],
    //layers: [Esri_OceanBasemap, boroughs, highlight],
    layers: [Esri_OceanBasemap, highlight],
    zoomControl: false,
    attributionControl: false
});

L.control.navbar().addTo(map);

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
    syncSidebar();
});


map.on('zoomend', function () {
    if (map.getZoom() == 10) {
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
    //map.fitBounds(boroughs.getBounds());
    featureList = new List("features", {valueNames: ["feature-name"]});
    featureList.sort("feature-name", {order: "asc"});


    var stationsBH = new Bloodhound({
        name: "Stations",
        datumTokenizer: function (d) {
            return Bloodhound.tokenizers.whitespace(d.station_name);
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
