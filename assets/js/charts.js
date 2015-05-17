var map, thisStation, mystation;
var flaskIcon = L.MakiMarkers.icon({icon: "chemist", color: "#09962F", size: "s"});
$(document).ready(function () {

    /*   ================================   Splash Screen  ============================*/
    //if ($.cookie('modal_shown') === null) {
    //    $.cookie('modal_shown', 'yes', {expires: 7, path: '/'});
    //    $('#myModal').modal({
    //        keyboard: false
    //    });
    //}
    /*   ================================    Functions   ============================*/
    $('#action').click(function () {
        $('#map-content').hide();
        $('#water-parameters-container').show();
        $("wp").scrollspy();
    });

    var geojsonMarkerOptions = {
        radius: 10,
        fillColor: "#DDE817",
        color: "#777",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var info = L.control();

    function highlightFeature(e) {
        var layer = e.target;
        info.update(layer.feature.properties);
    }

    function onEachFeature(feature, layer) {
        //if (feature.properties) {
        //   layer.bindPopup(feature.properties.station_name);
        //}
        layer.on({
            mouseover: highlightFeature,
            click: makeCharts
        });
    }

    function handleJson(data) {
        L.geoJson(data, {
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: flaskIcon});
                //return L.circleMarker(latlng, geojsonMarkerOptions);
                //return L.marker(latlng);
            }
        }).addTo(map);
    }


    $("#zoom-out-cape").click(function () {
        map.fitBounds(bounds);
    });

    /*   ================================LeafLet Map and Popups   ============================*/

    var southWest = L.LatLng(41.39741506646461, -71.25320434570312), northEast = L.LatLng(42.134894984239224, -69.64645385742188), bounds = L.LatLngBounds(southWest, northEast);

    map = L.map('map', {
        maxBounds: bounds,
        zoomControl: true
    }).setView([41.7672146942102, -70.35232543945312], 10);

    L.control.navbar().addTo(map);

    $.getJSON('data/stations.js', function(json) {
		var geoLayer = L.geoJson(json).addTo(map);

		//map
		//.fitBounds( geoLayer.getBounds() )
		//.setMaxBounds( geoLayer.getBounds().pad(0.5) );
		var geoList = new L.Control.GeoJSONList( geoLayer );
		geoList.on('item-active', function(e) {
			$('#selection').text( JSON.stringify(e.layer.feature.properties) );
		});
		map.addControl(geoList);

	});

    var Esri_OceanBasemap = L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
        maxZoom: 18
    }).addTo(map);



    /*  ====================    mcBrides Info Panel   ==========================================  */

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        //this._div.innerHTML = '<h4>Station Info</h4>' + (props ?
        this._div.innerHTML = ( props ? "Station Name: " + '<b>' + props.station_name + '</b><br />' + "Station Type: " + '<b>' + props.station_type + '</b>' : 'Hover over a Marker');
    };

    info.addTo(map);

    /*  ===========================    GeoServer request  for station points  =============================*/

    var rootUrl = 'http://tomcat.capecodgis.com/geoserver/capecodgis/ows';

    var defaultParameters = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'capecodgis:monitor_station',
        maxFeatures: 200,
        outputFormat: 'text/javascript',
        format_options: 'callback: getJson'

    };

    var parameters = L.Util.extend(defaultParameters);

    $.ajax({
        url: rootUrl + L.Util.getParamString(parameters),
        dataType: 'jsonp',
        jsonpCallback: 'getJson',
        success: handleJson
    });

    /*  ===========================    HighCharts   =============================*/

    function makeCharts(e) {

        $("#back-to-map").click(function () {
            $('#container1').hide();
            $('#container2').hide();
            $('#container3').hide();
            $('#container4').hide();
            $('#map').show();
        });

        $('#map').hide();
        $('#container1').show();
        $('#container2').show();
        $('#container3').show();
        $('#container4').show();

        var layer = e.target;
        thisStation = e.target.feature.properties.station_name;
        mystation = e.target.feature.id.split(".")[1];
        console.log(thisStation, ',', mystation)
        var temperature = [], salinity = [], dissolved_oxygen = [], nitrogen = [], phosphates = [], ammonium = [], total_nitrogen = [], total_phosphorus = [], chlorophyll = [], pheophytin = [], turbidity = [];


        $.ajax({
            type: "POST",
            url: "php/get_station_data.php",
            data: {
                "station_num_id": 9
            },
            dataType: 'json',
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            },
            success: function chartParser(data) {
                console.log('sdfadsdasf', mystation);
                var sampleDate, d, sampleYear;
                $('#map-content').hide();

                $('#chart-content').show();

                for (var i = 0; i < data.length; i++) {
                    sampleDate = data[i][0];
                    console.log('sample daate: ', sampleDate);
                    // in milliseconds for Highcharts
                    d = new Date(data[i][0]);
                    sampleYear = d.getFullYear();
                    temperature.push([sampleDate, data[i][1]]);
                    salinity.push([sampleDate, data[i][2]]);
                    dissolved_oxygen.push([sampleDate, data[i][3]]);
                    nitrogen.push([sampleDate, data[i][4]]);
                    phosphates.push([sampleDate, data[i][5]]);
                    ammonium.push([sampleDate, data[i][6]]);
                    total_nitrogen.push([sampleDate, data[i][7]]);
                    total_phosphorus.push([sampleDate, data[i][8]]);
                    chlorophyll.push([sampleDate, data[i][9]]);
                    pheophytin.push([sampleDate, data[i][10]]);
                    turbidity.push([sampleDate, data[i][11]]);
                }


                $("a.accordion-toggle").click(function () {
                    var thisYear = $(this).attr("data-attr");
                    chart1.xAxis[0].setExtremes(Date.UTC(thisYear, 0, 1), Date.UTC(thisYear, 11, 31));
                    chart2.xAxis[0].setExtremes(Date.UTC(thisYear, 0, 1), Date.UTC(thisYear, 11, 31));
                    chart3.xAxis[0].setExtremes(Date.UTC(thisYear, 0, 1), Date.UTC(thisYear, 11, 31));
                    chart4.xAxis[0].setExtremes(Date.UTC(thisYear, 0, 1), Date.UTC(thisYear, 11, 31));
                });


                var chart1_options = {

                    chart: {
                        height: 200,
                        renderTo: 'container1',
                        zoomType: 'x'
                    },

                    legend: {
                        enabled: false
                    },

                    title: {
                        text: 'Temperature, Salinity, Dissolved Oxygen for Station: ' + thisStation
                    },

                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            year: '%Y'
                        }

                    },
                    yAxis: [
                        {// Primary yAxis
                            labels: {
                                formatter: function () {
                                    return this.value + '°C';
                                },
                                style: {
                                    color: '#89A54E'
                                }
                            },
                            title: {
                                text: 'Temperature',
                                style: {
                                    color: '#89A54E'
                                }
                            },
                            opposite: true

                        },
                        {// Secondary yAxis
                            gridLineWidth: 0,
                            title: {
                                text: 'Dissolved Oxygen',
                                style: {
                                    color: '#4572A7'
                                }
                            },
                            labels: {
                                formatter: function () {
                                    return this.value + ' mg/L';
                                },
                                style: {
                                    color: '#4572A7'
                                }
                            }

                        },
                        {// Tertiary yAxis
                            gridLineWidth: 0,
                            title: {
                                text: 'Salinity',
                                style: {
                                    color: '#AA4643'
                                }
                            },
                            labels: {
                                formatter: function () {
                                    return this.value + ' ppt';
                                },
                                style: {
                                    color: '#AA4643'
                                }
                            },
                            opposite: true
                        }
                    ],
                    tooltip: {
                        shared: true
                    },
                    series: [
                        {
                            name: 'Temperature',
                            color: '#89A54E',
                            type: 'area',
                            data: temperature,
                            tooltip: {
                                valueSuffix: ' °C'
                            },
                            marker: {
                                enabled: false
                            }

                        },
                        {

                            name: 'Dissolved Oxygen',
                            color: '#4572A7',
                            type: 'spline',
                            yAxis: 1,

                            data: dissolved_oxygen,
                            tooltip: {
                                valueSuffix: ' mg/L'
                            },
                            marker: {
                                enabled: true
                            }

                        },
                        {
                            name: 'Salinity',
                            type: 'spline',
                            color: '#AA4643',
                            yAxis: 2,
                            data: salinity,
                            tooltip: {
                                valueSuffix: ' ppt'
                            },

                            marker: {
                                enabled: true
                            }

                        }
                    ]
                };
                var chart2_options = {

                    chart: {
                        height: 200,
                        renderTo: 'container2',
                        type: 'spline',
                        zoomType: 'x'
                    },

                    legend: {
                        enabled: false
                    },

                    title: {
                        text: 'Nitrates/Nitrites, Ortho-Phosphates, Ammonium for Station: ' + thisStation
                    },

                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            year: '%Y'
                        }

                    },
                    yAxis: [
                        {// Primary yAxis
                            labels: {
                                formatter: function () {
                                    return this.value + 'um';
                                },
                                style: {
                                    color: '#89A54E'
                                }
                            },
                            title: {
                                text: 'Nitrates/Nitrites',
                                style: {
                                    color: '#89A54E'
                                }
                            },
                            opposite: true

                        },
                        {// Secondary yAxis
                            //gridLineWidth: 0,
                            title: {
                                text: 'Ortho-Phosphates',
                                style: {
                                    color: '#4572A7'
                                }
                            },
                            labels: {
                                formatter: function () {
                                    return this.value + ' um';
                                },
                                style: {
                                    color: '#4572A7'
                                }
                            }

                        },
                        {// Tertiary yAxis
                            gridLineWidth: 0,
                            title: {
                                text: 'Ammonium',
                                style: {
                                    color: '#AA4643'
                                }
                            },
                            labels: {
                                formatter: function () {
                                    return this.value + ' um';
                                },
                                style: {
                                    color: '#AA4643'
                                }
                            },
                            opposite: true
                        }
                    ],
                    tooltip: {
                        shared: true
                    },

                    series: [
                        {
                            name: 'Nitrates/Nitrites',
                            color: '#89A54E',
                            type: 'line',
                            data: nitrogen,
                            tooltip: {
                                valueSuffix: ' um'
                            },
                            marker: {
                                enabled: true
                            }
                            //dashStyle: 'shortdot'
                        },
                        {
                            name: 'Ortho-Phosphates',
                            type: 'line',
                            color: '',
                            yAxis: 1,
                            data: phosphates,
                            tooltip: {
                                valueSuffix: ' um'
                            },
                            marker: {
                                enabled: true
                            }

                        },
                        {
                            name: 'Ammonium',
                            color: '#AA4643',
                            type: 'line',
                            data: ammonium,
                            tooltip: {
                                valueSuffix: ' um'
                            },
                            yAxis: 2,
                            marker: {
                                enabled: true
                            }

                        }
                    ]
                };
                var chart3_options = {

                    chart: {
                        height: 200,
                        type: 'spline',
                        renderTo: 'container3',
                        zoomType: 'x'
                    },

                    legend: {
                        enabled: false
                    },

                    title: {
                        text: 'Total Nitrogen and Phosphorus for Station: ' + thisStation
                    },

                    xAxis: [
                        {
                            type: 'datetime',
                            dateTimeLabelFormats: {
                                year: '%Y'
                            }
                        }
                    ],
                    yAxis: [
                        {// Primary yAxis
                            labels: {
                                format: '{value}um',
                                style: {
                                    color: '#89A54E'
                                }
                            },
                            title: {
                                text: 'Total Nitrogen',
                                style: {
                                    color: '#89A54E'
                                }
                            }
                        },
                        {// Secondary yAxis
                            title: {
                                text: 'Total Phosphorus',
                                style: {
                                    color: '#4572A7'
                                }
                            },
                            labels: {
                                format: '{value} um',
                                style: {
                                    color: '#4572A7'
                                }
                            },
                            opposite: true
                        }
                    ],
                    tooltip: {
                        shared: true
                    },

                    series: [
                        {
                            name: 'Total Nitrogen',
                            color: '#4572A7',

                            yAxis: 1,
                            data: total_nitrogen,
                            tooltip: {
                                valueSuffix: ' um'
                            },
                            marker: {
                                enabled: true
                            }

                        },
                        {
                            name: 'Total Phosphorus',
                            color: '#89A54E',

                            data: total_phosphorus,
                            tooltip: {
                                valueSuffix: ' um'
                            },
                            marker: {
                                enabled: true
                            }
                        }
                    ]
                };
                var chart4_options = {

                    chart: {
                        height: 200,
                        type: 'line',
                        renderTo: 'container4',
                        zoomType: 'x'
                    },

                    legend: {
                        enabled: false
                    },

                    title: {
                        text: 'Chlorophyll, Pheophytin, and Turbidity for Station: ' + thisStation
                    },

                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            year: '%Y'
                        }

                    },
                    yAxis: [
                        {// Primary yAxis
                            title: {
                                text: 'Turbidity',
                                style: {
                                    color: '#ED7842'
                                }
                            },

                            labels: {
                                formatter: function () {
                                    return this.value + ' NTU';
                                },
                                style: {
                                    color: '#ED7842'
                                }
                            }

                        },
                        {// Secondary yAxis
                            title: {
                                text: 'Chlorophyll',
                                style: {
                                    color: '#556b2f'
                                }
                            },
                            labels: {
                                formatter: function () {
                                    return this.value + ' ug/L';
                                },
                                style: {
                                    color: '#556b2f'
                                }
                            },
                            opposite: true
                        },
                        {// Tertiary yAxis
                            gridLineWidth: 0,
                            title: {
                                text: 'Pheophytin',
                                style: {
                                    color: '#8fbc8f'
                                }
                            },
                            labels: {
                                formatter: function () {
                                    return this.value + ' ug/L';
                                },
                                style: {
                                    color: '#8fbc8f'
                                }
                            },
                            opposite: true

                        }
                    ],
                    tooltip: {
                        shared: true
                    },

                    series: [
                        {
                            name: 'Turbidity',
                            color: '#A0522D ',
                            data: turbidity,
                            type: 'area',
                            yAxis: 1,
                            marker: {
                                enabled: false
                            },
                            tooltip: {
                                valueSuffix: ' NTU'
                            }
                        },
                        {
                            name: 'Pheophytin',
                            color: '#8fbc8f',
                            yAxis: 2,
                            data: pheophytin,
                            marker: {
                                enabled: true
                            },
                            tooltip: {
                                valueSuffix: ' ug/L'
                            }

                        },
                        {
                            name: 'Chlorophyll',
                            color: '#556b2f',
                            yaxis: 2,
                            data: chlorophyll,
                            marker: {
                                enabled: true
                            },
                            tooltip: {
                                valueSuffix: ' ug/L'
                            }
                        }
                    ]
                };

                var chart1 = new Highcharts.Chart(chart1_options);
                var chart2 = new Highcharts.Chart(chart2_options);
                var chart3 = new Highcharts.Chart(chart3_options);
                var chart4 = new Highcharts.Chart(chart4_options);

            }

        });
    }

});
