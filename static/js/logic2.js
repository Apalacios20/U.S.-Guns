// let myMap = L.map("map", {
//     center: [41.515111142650824, -112.22313302713114],
//     zoom: 3
// });

// let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         }).addTo(myMap);

/* GeoJson */
const geo = './static/data/geo_states.json'

/* state color json */
const color = './static/data/state_color.json'

/* State Center Points */
const center = './static/data/center_points.csv'

/* Guns */
const gun = './static/data/guns2.csv'

/* Custom marker icon */
let orangeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });


/* D3 */
Promise.all([d3.json(geo),d3.json(color),d3.csv(center),d3.csv(gun)])
                .then(function(data) {

    // Data
    const features = data[0].features
    const color = data[1]
    const centers = data[2]
    const guns = data[3]
    console.log('States Features:',features);
    console.log('State Color:', color); 
    console.log('center:', centers);
    console.log('Guns:', guns);    
    
    // Appending Blue and Red States
    let blue = [];
    let red = [];
    
    for (let i = 0; i < 25; i++) {
        blue.push(color[i]['Blue']);
        red.push(color[i]['Red']);
    };

    // Function for the color of State
    function chooseColor(name) {    
        if (blue.includes(name) ) return "blue";
        else return "red";
        };
        
    // Geo Json and Color function COME BACK TO LAYER  newLayer =
    let demo = L.geoJson(data[0], {
        style: function(feature) {
            return {
              color: "white",
              fillColor: chooseColor(feature.properties.NAME),
              fillOpacity: 0.65,
              weight: 0.85
            };
        }
    });//.addTo(myMap);


    // Marker lists
    let c_coordinates = []
    let markers = []
    let circles = []
    
    
    // Markers w/ center data
    for (let i = 0; i < 50; i++) {
        c_coordinates.push([centers[i]['Latitude'],centers[i]['Longitude']]);
        
        // Color conditionals
        let density = "";
        if (guns[i]['Registerd Guns'] > 500000) {
            density = "purple";
        }
        else if (guns[i]['Registerd Guns'] > 400000) {
            density = "red";
        }
        else if (guns[i]['Registerd Guns'] > 300000) {
            density = "orange";
        }
        else if (guns[i]['Registerd Guns'] > 200000) {
            density = "yellow";
        }
        else if (guns[i]['Registerd Guns'] > 100000) {
            density = "yellowgreen";
        }
        else {
            density = "green";
        }

        // Markers
        markers.push (
            L.marker(c_coordinates[i], {
                icon: orangeIcon               
                }).bindPopup(`<h1>${guns[i]['State']}</h1><hr>
                    <h3>Population: ${guns[i]['Population']}</H3>
                    <h3>Registered Guns: ${guns[i]['Registerd Guns']}</H3>
                    <h3>Pop. Gun Ownership: ${guns[i]['Gun Ownership']}</H3>
                    <h3>School Shootings: ${guns[i]['School Shootings']}</H3>`)
                        // .addTo(myMap);
        );
        
        // Circles
        circles.push(
            L.circle(c_coordinates[i], {
                fillOpacity: 0.65,
                color: "white",
                fillColor: density,
                weight: 0.55,
                radius: Math.sqrt(guns[i]['Registerd Guns']) * 600
                    })//.bindPopup(`<h1>${guns[i]['State']}</h1><hr>
                        // <h3>Population: ${guns[i]['Population']}</H3>
                        // <h3>Registered Guns: ${guns[i]['Registerd Guns']}</H3>
                        // <h3>Pop. Gun Ownership: ${guns[i]['Gun Ownership']}</H3>
                        // <h3>School Shootings: ${guns[i]['School Shootings']}</H3>`)
                            // .addTo(myMap)
        );

    }

    /* MAP */

    // Base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
      
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
    

    // Lists into layer groups
    let party = L.layerGroup(demo);
    let marker_layer = L.layerGroup(markers);
    let circle_layer = L.layerGroup(circles);

    // baseMaps object.
    let baseMaps = {
        "Street": street,
        "Topographic": topo
    };

    // Overlay object to hold our overlay
    let overlayMaps = {
        "Info": marker_layer,
        "Fire Arms Density": circle_layer,
        "Polical Party": demo
    };

    // Default map
    let myMap = L.map("map", {
        center: [41.515111142650824, -112.22313302713114],
        zoom: 3.25,
        layers: [street, marker_layer]
    });

    // Layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    /*Legend*/
    function getColor(d) {
        return d > 500000 ? "purple" :
            d > 400000  ? "red" :
            d > 300000  ? "orange" :
            d > 200000  ? "yellow" :
            d > 100000   ? "yellowgreen" :
                    "green";
    }

    let legend = L.control({
        position: "bottomleft"
    });

    legend.onAdd = function(myMap) {
        let div = L.DomUtil.create("div", "info legend"),
            grades = [0, 100000, 200000, 300000, 400000, 500000],
            labels = ["<strong> Registered Guns </strong>"],
            from, to;
        for (let i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];
            labels.push(
                "<i style='background:" + getColor(from + 1) + "'></i>" + from + (to ? "&ndash;" + to: "+"));
        }    
        div.innerHTML = labels.join("<br>");
        return div;
        };

        legend.addTo(myMap);

    }
);
