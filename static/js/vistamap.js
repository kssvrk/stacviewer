
function clickHandler(e) {

    var clickBounds = L.latLngBounds(e.latlng, e.latlng);
    var intersectingFeatures = [];
    stac_features=stac_polygons.getLayers(); // in stac.js 
    var listhtml='';
    
    for (var f in stac_features) {
        var feature = stac_features[f];
        if(clickBounds.intersects(feature.getBounds()))
        {
            intersectingFeatures.push(feature);
            listhtml=listhtml+clicked_feature(feature);
        }
    }
    if(intersectingFeatures.length>0){
        //console.log(intersectingFeatures);
        clicklist=document.getElementById("clicklist");
        clicklist.innerHTML=listhtml;
        myModal.show();
    }
    
}

function clicked_feature(feature)
{
    console.log(feature);
    var img_url=feature['vista_assets']['thumbnail']['href']
    var name=feature.vista_id
    template=`<div class="accordion-item">
    <h2 class="accordion-header" id="heading${name}">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${name}" aria-expanded="true" aria-controls="collapse${name}">
      ${name}
      </button>
    </h2>
    <div id="collapse${name}" class="accordion-collapse collapse" aria-labelledby="heading${name}" data-bs-parent="#clicklist">
      <div class="accordion-body">
      ${name} 
      <img width=100 height=100 src="${img_url}" alt="thumbnail" class="img-thumbnail">
      <a href="javascript:display_cog('${name}')" type="button" class="btn btn-danger"> Visualise </a>
      </div>
    </div>
  </div>`;

  return template;
}

function toggle_display(el,flex)
{
    console.log(el.style.display);
    if(!flex){
        if(el.style.display=='none')
        {
            el.style.display='block';
        }
        else{
            el.style.display='none';
        }
    }
    else{
        if(el.classList.contains("d-flex"))
        {
            el.classList.remove("d-flex")
            el.classList.add("d-none");
        }
        else{
            el.classList.remove("d-none")
            el.classList.add("d-flex");
        }
    }
}

function sidebarcollapse()
{
    // logo ,sidebar display toggle;
    logo=document.getElementById("logo");
    sidebar=document.getElementById("sidebar");
    toggle_display(logo);
    toggle_display(sidebar,true);
}

document.getElementById("logo").style.display = 'none'; 


var map = L.map('map').setView([28, 70], 13);

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(map);

var baseMaps = {
    "OpenStreetMap": osm,
    "Google Maps": googleSat
};

var overlayMaps={}

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
map.on('click', clickHandler);
//L.marker([51.5, -0.09]).addTo(map);
var myModal = new bootstrap.Modal(document.getElementById('clickmodal'), {})