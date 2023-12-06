const DEBUG = false;
const apiKey = "52cc4f6275d043cc0b5b26335cce427e";

var searchForm = $("#search-form");
var searchInput = $("#city-search");

searchForm.on("submit", (e) => {
    e.preventDefault();
    console.log(searchInput.val());

    var searchedCity = searchInput.val();
    var apiCurrentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${apiKey}`;
    var apiForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchedCity}&appid=${apiKey}&cnt=5`;
    
    fetch(apiCurrentUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (currentWeatherRaw) {
            console.log(currentWeatherRaw);
            //display
        })
    
    fetch(apiForecastUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (forecastWeatherRaw) {
            console.log(forecastWeatherRaw);
            //display
        })

    // add city to search history
});

// API Tests
if (DEBUG) {
    let testCity = "Perth";
    let testUrl = `https://api.openweathermap.org/data/2.5/weather?q=${testCity}&appid=${apiKey}`;

fetch(testUrl)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data)
    })
}