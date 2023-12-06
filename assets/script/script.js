const DEBUG = false;
const apiKey = "52cc4f6275d043cc0b5b26335cce427e";

var searchForm = $("#search-form");
var searchInput = $("#city-search");



searchForm.on("submit", (e) => {
    e.preventDefault();
    console.log(searchInput.val());
    // api calls to openweather
    // display current weather
    // display forecasts

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