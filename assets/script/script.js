const DEBUG = false;
const apiKey = "52cc4f6275d043cc0b5b26335cce427e";

var searchFormEl = $("#search-form");
var searchInputEl = $("#city-search");
var currentWeatherRootEl = $("#current-weather");
var forecastRootEl = $("#forecast");

searchFormEl.on("submit", (e) => {
    e.preventDefault();
    currentWeatherRootEl.empty();
    forecastRootEl.empty();

    var searchedCity = searchInputEl.val();
    var apiCurrentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${apiKey}&units=metric`;
    var apiForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchedCity}&appid=${apiKey}&units=metric`;
    
    fetch(apiCurrentUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (currentWeatherRaw) {
            console.log(currentWeatherRaw);
            var currentWeatherProcessed = processWeather(currentWeatherRaw);

            var cityNameEl = $('<p>');
            var currentDateEl = $('<p>');
            var iconImgEl = $('<img>');
            var currentTemperatureEl = $('<p>');
            var conditionSummaryEl = $('<p>');
            var conditionListEl = $('<ul>');
            var minEl = $('<li>');
            var maxEl = $('<li>');
            var windEl = $('<li>');
            var humidEl = $('<li>');

            cityNameEl.text(currentWeatherProcessed.city);
            currentDateEl.text(`Weather at ${currentWeatherProcessed.dateTime}:`);
            currentTemperatureEl.text(`${currentWeatherProcessed.temperature}°C`);
            conditionSummaryEl.text(currentWeatherProcessed.summary);
            iconImgEl.attr("src", currentWeatherProcessed.iconUrl);

            minEl.text(`Minimum: ${currentWeatherProcessed.tempMin}°C`);
            maxEl.text(`Maximum: ${currentWeatherProcessed.tempMax}°C`);
            windEl.text(`Wind speed: ${currentWeatherProcessed.windSpeed}km/h`);
            humidEl.text(`Humidity: ${currentWeatherProcessed.humidity}%`);

            conditionListEl.append(minEl);
            conditionListEl.append(maxEl);
            conditionListEl.append(windEl);
            conditionListEl.append(humidEl);

            currentWeatherRootEl.append(cityNameEl);
            currentWeatherRootEl.append(currentDateEl);
            currentWeatherRootEl.append(iconImgEl);
            currentWeatherRootEl.append(currentTemperatureEl);
            currentWeatherRootEl.append(conditionSummaryEl);
            currentWeatherRootEl.append(conditionListEl);
        })
    
    fetch(apiForecastUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (forecastRaw) {
            console.log(forecastRaw);
            for(let i=0; i<forecastRaw.list.length; i++) {
                var forecastProcessed = processWeather(forecastRaw.list[i], forecastRaw.city.timezone);

                var forecastDayCardEl = $('<article>')
                var forecastDateEl = $('<p>');
                var iconImgEl = $('<img>');
                var conditionSummaryEl = $('<p>');
                var conditionListEl = $('<ul>');
                var tempEl = $('<li>');
                var windEl = $('<li>');
                var humidEl = $('<li>');
    
                forecastDateEl.text(forecastProcessed.date);
                conditionSummaryEl.text(forecastProcessed.summary);
                iconImgEl.attr("src", forecastProcessed.iconUrl);
    
                tempEl.text(`Temp: ${forecastProcessed.tempMin}°C`);
                windEl.text(`Wind: ${forecastProcessed.windSpeed}km/h`);
                humidEl.text(`Humid: ${forecastProcessed.humidity}%`);
    
                conditionListEl.append(tempEl);
                conditionListEl.append(windEl);
                conditionListEl.append(humidEl);
    
                forecastDayCardEl.append(forecastDateEl);
                forecastDayCardEl.append(iconImgEl);
                forecastDayCardEl.append(conditionSummaryEl);
                forecastDayCardEl.append(conditionListEl);

                forecastRootEl.append(forecastDayCardEl);
            }
        })

    // add city to search history
});

function processWeather(rawWeather, timezone) {
    var processedWeather = {
        city: "",
        date: "",
        dateTime: "",
        summary: "",
        iconUrl: "",
        temperature: "",
        tempMin: "",
        tempMax: "",
        windSpeed: "",
        humidity: ""
    };
    processedWeather.city = rawWeather.name;
    processedWeather.summary = rawWeather.weather[0].main;
    processedWeather.temperature = rawWeather.main.temp;
    processedWeather.tempMin= rawWeather.main.temp_min;
    processedWeather.tempMax = rawWeather.main.temp_max;
    processedWeather.windSpeed = rawWeather.wind.speed;
    processedWeather.humidity = rawWeather.main.humidity;

    var iconCode = rawWeather.weather[0].icon;
    processedWeather.iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
    
    // date
    // use rawWeather.dt+timezone
    // then convert to UTC time

    return processedWeather;
}



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