//========================================================================
//== Project: Team Project for Web Dev                                 ===
//== Team Members: Kayla Lambert and Kyle Burgi                        ===
//== Purpose: JavaScript file for STA Bus Arrival/Depature app         ===
//== Date Created: 11/25/2019                                          ===
//== Last Modified: 11/26/2019                                         ===
//========================================================================


$(document).ready(start);

//========= Global Variables =============================================
const routes = [];
const selectRoutes = [];
const stops = [];
const selectStops = [];
const stopsData = [];


function start(){
    getRoutes();

    // ----  stop listeners ----

    //select multiple stops/routes
    $(document.body).on("mousedown", "option", function(event){
        event.preventDefault();
        var curSelect = event.currentTarget.value; //gets number
        var isNotNum = isNaN(event.currentTarget.value); //checks to see if it is a route or stop
        $(this).prop('selected', !$(this).prop('selected')); //shades selected

        var curIndex = selectRoutes.indexOf(curSelect); //gets index of selected Route
        var curStopIndex = selectStops.indexOf(curSelect); //gets index of selected Stop

        //if index is < 0 then we push it to the array
        //else we splice it out of the array
        if(curIndex < 0 && !isNotNum){
            selectRoutes.push(event.currentTarget.value);
            console.log("Adding: "+ curSelect);
            console.log("Route Array Contains: " + selectRoutes);
        }else if(curStopIndex < 0 && isNotNum){
            selectStops.push(event.currentTarget.value);
            console.log("Adding: "+ curSelect);
            console.log("Stops Array Contains: " + selectStops);
        }else if(curIndex >= 0 && !isNotNum){
            selectRoutes.splice(curIndex, 1);
            console.log("Deleting: " + curSelect);
            console.log("Array Contains: "+ selectRoutes);
        }else{
            selectStops.splice(curStopIndex, 1);
            console.log(selectStops[curStopIndex]);
            console.log("Deleting: "+ curSelect);
            console.log("Stops Array Contains: " + selectStops);
        }
        return false;        
    });

    //keypress on enter for location setting
    $(document).on("keypress", function(e){
        if(e.which == 13 && $("#location").val() != ""){
            getRoutesByLocation($("#location").val());
        }
    })

    //clicking continue on routes for manual
    $("#stopContinue").click(function(event){
        //console debugs
        //console.log($("#stopSelect").find('option'));
        //console.log($("#stopSelect").find('selected'));
        console.log(selectRoutes);
        console.log(stops);

        //actual logic
        $("#stopSelect").find('option').remove();
        for(let i = 0; i < selectRoutes.length; i++){
            getStops(selectRoutes[i]);
        }
        $("#stopContinue").remove();
    });

    //Toggle between manual and automatic
    $(".stopManual").click(function(){
        let $this = $(this);
        $("#location").remove();
        $("#stopSelect").find('option').remove();

        $(".stopManual").toggleClass("stopAuto");
        if($this.hasClass("stopAuto")){
            $this.text("Automatic Stop Picker");
            let loc = document.createElement("input");
            loc.setAttribute("id", "location");
            loc.setAttribute("type", "text");
            loc.setAttribute("placeholder", "Address...");
            $("#stopSelect").before(loc);
        } 
        else {
            $this.text("Manual Stop Picker");
            getRoutes();
        }
    });

    //Clicking Save Changes Button
    $("#btnSaveChanges").click(function(){
        getArrivals();
    });
}

//========= Set Up Functions =============================================

// ------- All Routes ---------
function getRoutes(){
    let link = "http://52.88.188.196:8080/api/api/where/route-ids-for-agency/STA.json?key=TEST";
    $.get(link, gotRoutes, "jsonp");
}

// REFACTOR THIS BITCH
function getArrivals(){
    console.log(selectStops);
    for(let i = 0; i<selectStops.length; i++){
        let link = "http://52.88.188.196:8080/api/api/where/arrivals-and-departures-for-stop/" + selectStops[i] +".json?key=TEST"
        $.get(link, gotArrivals, "jsonp");
    }
}

function gotArrivals(data){
    //console.log(data);
    
    //get time stuff
    var currentTime = data.currentTime;
    var dateTime = new Date(currentTime);

    //individual info
    for(let i = 0; i < data.data.entry.arrivalsAndDepartures.length; i++){
        //time info for arrivals
        var predArrivalTime = new Date(data.data.entry.arrivalsAndDepartures[i].predictedArrivalTime);
        var preDepartureTime = new Date(data.data.entry.arrivalsAndDepartures[i].predictedDepartureTime);
        

        //get other info
        var routeLongName = data.data.entry.arrivalsAndDepartures[i].routeLongName;
        var stopId = data.data.entry.arrivalsAndDepartures[i].stopId;
        var calcDiffMinutes = predArrivalTime.getMinutes() - dateTime.getMinutes();
        //console.log("Route: " + routeLongName + ", StopId: " + stopId + ", Arrival Time: " + predArrivalTime + ", Departure Time: " + preDepartureTime); 

        
        
        //Console Debug
        if(calcDiffMinutes < 0 ){
            console.log(routeLongName + " Departed " + calcDiffMinutes * -1 + " minutes ago @ " + preDepartureTime);
            
        }else{
            console.log(routeLongName + " Departs in " + calcDiffMinutes + " minutes @ " + preDepartureTime);
        }
    }
}

function gotRoutes(data){
    for(let i = 0; i < data.data.list.length; i++){
        let temp = data.data.list[i].split('_');
        routes.push(temp[1]);
    }
    routes.sort(sortNumber);
    for(let i = 0; i < routes.length; i++){
        displayRoutes(routes[i]);
    }
}

function catchArrivals(data){
    stopsData.push(data);   
}

function displayRoutes(route){
    let opt = document.createElement("option");
    opt.value = route;
    opt.innerHTML = "STA " + route;
    opt.setAttribute("id", route);
    
    $("#stopSelect").append(opt);
}

function displayArrival(){

}


// ------- Routes by Location -------
function getRoutesByLocation(location){
    let loc = location.split(' ').join('+');
    let link = "https://maps.googleapis.com/maps/api/geocode/json?address=" + loc + "&key=AIzaSyC2rQCrrOuoazv2KxypU-0jAQHmU-EZmNA";
    $.get(link, getRoutesLoc, "json");
}

function getRoutesLoc(data){
    let lat = data.results[0].geometry.location.lat;
    let long = data.results[0].geometry.location.lng;

    let link = "http://52.88.188.196:8080/api/api/where/stops-for-location.json?key=TEST&lat=" + lat + "&lon=" + long + "&radius=80";
    $.get(link, gotRoutesLoc, "jsonp");
}

function gotRoutesLoc(data){
    for(let i = 0; i < data.data.list.length; i++){
        //console.log(data.data.list[i]);
        displayStops(data.data.list[i].id);
    }
}



// ------- Stops ---------
function getStops(id){
    console.log("ID: " + id);
    let link = "http://52.88.188.196:8080/api/api/where/stops-for-route/STA_" + id + ".json?key=TEST";
    $.get(link, gotStops, "jsonp");
}

//  currently displaying ALL stops(?)
function gotStops(data){
    console.log(data.data.entry.stopIds.length); //displays every route I think
    
    for(let i = 0; i < data.data.entry.stopIds.length; i++){
        stops.push(data.data.entry.stopIds[i]);
        displayStops(data.data.entry.stopIds[i]);
        //console.log(data.data.entry.stopIds[i]);
    }
    
}

function displayStops(stop){
    let opt = document.createElement("option");
    opt.value = stop;
    opt.innerHTML = stop;
    opt.setAttribute("id", stop);
    
    $("#stopSelect").append(opt);
}


//----------- Color Functions ----------------
function colorChanged(){
    let colorScheme = $("#colorSelect").val();
    let color1, color2, color3;
    
    switch(colorScheme){
        case "ewu":
            color1 = "#A10022";
            color2 = "#ffffff";
            color3 = "#000000";
            break;
        case "gonzaga":
            color1 = "#041E42";
            color2 = "#C8102E";
            color3 = "#C1C6C8";
            break;
        case "christmas":
            color1 = "#146B3A";
            color2 = "#BB2528";
            color3 = "#ffffff";
            break;
        case "july4":
            color1 = "#2578B2";
            color2 = "#AD001E";
            color3 = "#ffffff";
            break;
        case "custom":
            
            break;
        default:
            color1 = "#17B3FF";
            color2 = "#55E629";
            color3 = "#ffffff";
    }
    $(":root").css("--color-1", color1);
    $(":root").css("--color-2", color2);
    $(":root").css("--color-3", color3);
}



//========= Helper Functions =============================================

function sortNumber(a, b){
    return a - b;
}