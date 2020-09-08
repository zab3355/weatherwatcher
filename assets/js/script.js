"use strict";
var map;
var marker;
//called and initialized the google map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
    });
}

//implementing geolocation, current location when button is pressed, searches the latitude and longitude coordinates and puts into heroku database
$("#location").on("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $("#map").removeClass("full-width").addClass("half-width");
            $("#weather-info").removeClass("hidden").addClass("half-width");
            clearMarker();
            var coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            $.get('https://weather-watcher-zach.herokuapp.com/weather/geo', { lat: coords.lat, lon: coords.lng }, function (data) {
                console.log("hi");
                map.setCenter(coords);
                marker = new google.maps.Marker({
                    position: coords,
                    map: map
                });
                renderWeather(data);
            });
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
});


//what happens when search is clicked, goes to heroku database and puts marker on search location in latitude and longtitude and renders
$('#search').on('click', () => {
    var address = $('#searchterm').val();
    $.get('https://weather-watcher-zach.herokuapp.com/weather/city', { address: address }, function (data) {
        $("#map").removeClass("full-width").addClass("half-width");
        $("#weather-info").removeClass("hidden").addClass("half-width");
        clearMarker();
        var coords = { lat: data.coord.lat, lng: data.coord.lon };
        map.setCenter(coords);
        marker = new google.maps.Marker({
            position: coords,
            map: map
        });
        renderWeather(data);
    });
});

//function that shows weather data from the api
function renderWeather(data) {
    $("#weather-info").empty();
    var p = $("<p>").text(data.address);
    $("#weather-info").append(p);
    p = $("<p>").text("Max Temp: " + data.main.temp_max);
    $("#weather-info").append(p);
    p = $("<p>").text("Min Temp: " + data.main.temp_min);
    $("#weather-info").append(p);
    p = $("<p>").text("Current Temp: " + data.main.temp);
    $("#weather-info").append(p);
    var i = renderIcon(data.weather[0].main);
    $("#weather-info").append(i);
    p = $("<p>").text(data.weather[0].description);
    $("#weather-info").append(p);
    p = $("<p>").text("Wind Speed: " + data.wind.speed);
    $("#weather-info").append(p);
    p = $("<p>").text("We recommend: ");
    $("#weather-info").append(p);
    p = renderWear(data.weather[0].main, data.main.temp);
    $("#weather-info").append(p);
}

//function that shows different icons depending on precipitation 
function renderIcon(currentWeather) {
    var i = $("<i>").addClass("fas");
    if(currentWeather === "Clouds"){
        i.addClass("fa-cloud");
    }
    else if(currentWeather === "Rain" || currentWeather === "Drizzle"){
        i.addClass("fa-tint");
    }
    else if(currentWeather === "Snow"){
        i.addClass("fa-snowflake");
    }
    else if (currentWeather === "Sunny" || currentWeather === "Clear"){
        i.addClass("fa-sun");
    }
    return i;

}

//function that shows what to wear depending on preipitation and weather conditions
function renderWear(currentWeather, currentTemp){
    var p = $("<p>");
    if(currentWeather === "Rain" || currentWeather === "Drizzle" || currentWeather === "Snow"){
        p.text("Coat");
    }
    else if(currentTemp > 70){
        p.text("Shorts and a T-Shirt");
    }
    else if(currentTemp > 50) {
        p.text("Long Sleeve Shirt");
    }
    else if(currentTemp > 20){
        p.text("Coat and a hat");
    }
    else{
        p.text("BUNDLE UP!!!");
    }

    return p;
}

//function that clears markers on the map once another search or current location is selected
function clearMarker() {
    if(marker){
        marker.setMap(null);
    }  
}