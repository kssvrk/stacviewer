

function setup_collections()
{
    let collectionhtml='';
    for (collection in collections)
    {
        let active='';
        
        collectionhtml+=`<a href="javascript:update_collections('collection_${collection}')" id="collection_${collection}" class="list-group-item list-group-item-action ${active}" value="${collection}">${collection}</a>`;
    }
    document.getElementById('collectionlist').innerHTML=collectionhtml;
    update_collections();
}

function update_collections(id)
{
    
    if(id){
        selected_collection=id.substring(11); //remove the collection_ string 
    }
    let element=document.getElementById(selected_collection);
    
   
    
    for (collection in collections)
    {
        let element=document.getElementById(`collection_${collection}`);
        if(collection==selected_collection)
        {
            element.classList.add("active");
        }
        else{
            element.classList.remove("active");
        }
    }

    get_date_range(selected_collection);
}

function set_min_max_date(name,min,max)
{
    els=document.getElementsByName('ImagingDate');
    for(var id in els)
    {
        if(min){els[id].min=min;}
        if(max){els[id].max=max;}
        
    }
}

async function get_date_range(collection)
{
    const response=await fetch(collections[collection]['link']);
    const resjson = await response.json();
    const range = resjson['extent']['temporal']['interval'][0];
    let date1,date2= new Date();
    if(range[0]){
        date1=new Date(range[0]);
    }
    
    if(range[1]){
        date2=new Date(range[1]);
    }
    
    set_min_max_date(
        'ImagingDate',
        date1.toISOString().split('T')[0],
        date2.toISOString().split('T')[0]
    );


    
}

async function get_collection_items(collection_url) {

    let items_url = collection_url+'/items';
    const response = await fetch(items_url);
    const items = await response.json();
    console.log(items);
    return items;
}

function update_foot_print_status(text)
{
    document.getElementById("footprintstatus").innerHTML=text;
}


async function get_foot_prints()
{
    update_foot_print_status(`Clearing previous data..`);
    stac_polygons.clearLayers();
    console.log('Searching Stac Catalogs for ');
    
    console.log(selected_collection);
    let search_collection=collections[selected_collection]['name'];
    let start_date=document.getElementById('start-date').value;
    let end_date=document.getElementById('end-date').value;
    let timestring=`${start_date}T00:00:00Z/${end_date}T12:31:12Z`
    payload={
        "datetime":timestring,
        "collections":[search_collection],
        "limit":10
    }
    let limit=100;  
    let items=[];
    hit_url=search_url+`?collections=${search_collection}&datetime=${timestring}&limit=${limit}`
    let page=0;
    update_foot_print_status(`loading Stac results page : ${page}`);
    let response = await fetch(hit_url);
    let items_response = await response.json();
    
    items=items.concat(items_response['features']);
    console.log(items_response);
    console.log(items);
    
    var next_link='';
    for (var link in items_response['links'])
    {
        if(items_response['links'][link]['rel']=='next')
        {
            next_link=items_response['links'][link]['href'];
            break;
        }
    }
    console.log(next_link);

    while ( items_response['features'].length > 0  && items.length < 500 )
    {
        page = page+1;
        update_foot_print_status(`loading Stac results page : ${page}`);
        console.log(next_link);
        response = await fetch(next_link);
        items_response = await response.json();
        
        items=items.concat(items_response['features']);
        console.log(items);
        for (var link in items_response['links'])
        {
            if(items_response['links'][link]['rel']=='next')
            {
                next_link=items_response['links'][link]['href'];
            }
        }
    }
    console.log('Total Items')
    console.log(items.length);
    update_foot_print_status(`Total Items loaded : ${items.length}`)
    
    for (var id in items){

        item=items[id]
        if(id==0){console.log(item);}
        
        carray=[]
        for (c in item['geometry']['coordinates'][0])
        {
            a=item['geometry']['coordinates'][0];
            carray.push([a[c][1],a[c][0]]);
        }
        
        var polygon = L.polygon(
            carray,
            {
                color: 'yellow',
                fillOpacity: 0
            }
        );
            
        polygon.vista_id=item['id'];
        polygon.vista_assets=item['assets'];
        polygon.addTo(stac_polygons)
        
        

        // polygon.on('click', function () {
        //     //mymap.fitBounds(polygon.getBounds());
        //     alert(this.vista_id);
        //     this.setStyle({
        //         color:'red'
        //     });
        //     //get_tiler_url(this.vista_assets['visual']['href']);
        // });
    }   
    if(items.length>0)
    {
        stac_polygons.addTo(map);
        map.fitBounds(stac_polygons.getBounds());
    }
}

async function get_tiler_url(cog_file,name)
{
    let response= await fetch(tiler_url+`?url=${cog_file}`);
    let tiler_json = await response.json();
    console.log(tiler_json);

    let tl=L.tileLayer(
        tiler_json['tiles'][0],
        {
            bounds:[
                new L.LatLng(tiler_json['bounds'][1],tiler_json['bounds'][0]),
                new L.LatLng(tiler_json['bounds'][3],tiler_json['bounds'][2])
            ]
        }
    )
    tl.addTo(map); 
    myModal.hide();
    alert("Added name to layers");
    layerControl.addOverlay(tl,name);
    
}

function display_cog(id)
{
    ls=stac_polygons.getLayers();
    for (lid in ls)
    {
        if(ls[lid]['vista_id']==id){
            console.log(`Adding ${lid} to display layers`)
            get_tiler_url(ls[lid].vista_assets['visual']['href'],id);
        }
    }

    //get_tiler_url(this.vista_assets['visual']['href']);
}

function features_to_items(features)
{
    for (var id in features){
        console.log(features[id]);
    }
}

// let items = get_collection_items(collection_url);
// items.then(
//     res  => {features_to_items(res['features'])}
// )

// ---- Initialisations ---------
collections={
    'sentinel-2-l2a':{
        'link':'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a',
        'name':'sentinel-2-l2a'
    },
    'sentinel-2-l2a-1':{
        'link':'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a',
        'name':'sentinel-2-l2a'
    }
}
limit_results=500;
var stac_polygons = L.featureGroup([]);
layerControl.addOverlay(stac_polygons, "STAC Loaded Layer");

tiler_url='http://localhost:8001/cog/tilejson.json'
search_url='https://earth-search.aws.element84.com/v1/search/'
selected_collection=Object.keys(collections)[0];
document.getElementById('start-date').valueAsDate = new Date();
document.getElementById('end-date').valueAsDate = new Date();
setup_collections();
