$(function () {
    const DEBUG = false;
    const NUM_DAY_FORECAST = 5;
    const API_KEY = "52cc4f6275d043cc0b5b26335cce427e";

    // DOM elements. Elements that should not be visible at page load should be hidden
    var searchFormEl = $("#search-form");
    var searchInputEl = $("#city-search");
    var currentWeatherRootEl = $("#current-weather");
    var forecastRootEl = $("#forecast");
    var searchHistoryRootEl = $("#search-history");
    var forecastHeadingEl = $("#forecast-heading");

    currentWeatherRootEl.hide();
    forecastHeadingEl.hide();

    // Initialise search history from local storage
    var searchHistoryList = [];
    if (localStorage.getItem("history")) {
        searchHistoryList = JSON.parse(localStorage.getItem("history"));
    }
    renderSearchHistory();

    // Search for designated city at form submit
    searchFormEl.on("submit", (event) => {
        event.preventDefault();
        searchAndDisplay(searchInputEl.val());
    });

    // Search for designated city at search history click
    searchHistoryRootEl.on("click", (event) => {
        event.preventDefault();
        if(event.target.matches(".search-item")) {
            searchAndDisplay($(event.target).text());
        }
    });

    function searchAndDisplay(searchedCity) {
        // Empty root elements and show hidden elements
        currentWeatherRootEl.empty();
        forecastRootEl.empty();
        searchHistoryRootEl.empty();
        currentWeatherRootEl.show();
        forecastHeadingEl.show();

        // API request URLs
        var apiCurrentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${API_KEY}&units=metric`;
        var apiForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchedCity}&appid=${API_KEY}&units=metric`;
        
        fetch(apiCurrentUrl)
            .then(function (response) {
                return response.json();
            })
            .then(function (currentWeatherRaw) {
                var currentWeatherProcessed = processWeather(currentWeatherRaw, currentWeatherRaw.timezone);

                // Initialise new DOM elements for current weather card
                var cityNameEl = $('<h2>');
                var currentDateEl = $('<p>');
                var iconImgEl = $('<img>');
                var currentTemperatureEl = $('<h3>');
                var conditionSummaryEl = $('<h4>');
                var conditionListEl = $('<ul>');
                var minEl = $('<li>');
                var maxEl = $('<li>');
                var windEl = $('<li>');
                var humidEl = $('<li>');

                // Populate current weather DOM elements
                cityNameEl.text(currentWeatherProcessed.city);
                currentDateEl.text(`Weather at ${currentWeatherProcessed.dateTime}:`);
                currentTemperatureEl.text(`${currentWeatherProcessed.temperature}°C`);
                conditionSummaryEl.text(currentWeatherProcessed.summary);
                iconImgEl.attr("src", currentWeatherProcessed.iconUrlBig);

                minEl.text(`Minimum: ${currentWeatherProcessed.tempMin}°C`);
                maxEl.text(`Maximum: ${currentWeatherProcessed.tempMax}°C`);
                windEl.text(`Wind speed: ${currentWeatherProcessed.windSpeed}km/h`);
                humidEl.text(`Humidity: ${currentWeatherProcessed.humidity}%`);

                // Append new DOM elements to existing root elements
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
                // The forecast data contains three-hourly forecasts, so we need to collate them by day
                var forecastCardList = []
                
                for (let i=0; i<forecastRaw.list.length; i++) {
                    var forecastProcessed = processWeather(forecastRaw.list[i], forecastRaw.city.timezone);
                
                    // Select the card for the forecast's date
                    // If none exists, create a new card for that day
                    var currentCard = forecastCardList.find((card) => card.date == forecastProcessed.date);
                    if (!currentCard) {
                        currentCard = {
                            date: forecastProcessed.date,
                            summary: [],
                            iconUrl: [],
                            temp: [],
                            wind: [],
                            humid: []
                        }
                        forecastCardList.push(currentCard);
                    }

                    // Add the forecast data to the card lists
                    currentCard.summary.push(forecastProcessed.summary);
                    currentCard.iconUrl.push(forecastProcessed.iconUrl);
                    currentCard.temp.push(forecastProcessed.temperature);
                    currentCard.wind.push(forecastProcessed.windSpeed);
                    currentCard.humid.push(forecastProcessed.humidity);
                }

                // The result will be a 5 or 6-card long array
                // If the array has 6 cards, the first is the current day, so we shift it
                while (forecastCardList.length > NUM_DAY_FORECAST) {
                    forecastCardList.shift();
                }

                for (let i=0; i<NUM_DAY_FORECAST; i++) {
                    // Initialise new DOM elements for day's forecast card
                    var forecastDayCardEl = $('<article>')
                    var forecastDateEl = $('<p>');
                    var iconImgEl = $('<img>');
                    var conditionSummaryEl = $('<p>');
                    var conditionListEl = $('<ul>');
                    var minEl = $('<li>');
                    var maxEl = $('<li>');
                    var windEl = $('<li>');
                    var humidEl = $('<li>');

                    // Classes for page style
                    forecastDayCardEl.addClass("forecast-card col-2");

                    // Populate forecast DOM elements
                    // The most common or maximum element is used to represent the day's conditions
                    forecastDateEl.text(forecastCardList[i].date);
                    conditionSummaryEl.text(mostCommon(forecastCardList[i].summary));
                    iconImgEl.attr("src", mostCommon(forecastCardList[i].iconUrl));
                    
                    minEl.text(`Min Temp: ${Math.min.apply(null, forecastCardList[i].temp)}°C`);
                    maxEl.text(`Max Temp: ${Math.max.apply(null, forecastCardList[i].temp)}°C`);
                    windEl.text(`Max Wind: ${Math.max.apply(null, forecastCardList[i].wind)}km/h`);
                    humidEl.text(`Max Humid: ${Math.max.apply(null, forecastCardList[i].humid)}%`);
        
                    // Append new DOM elements to existing root elements
                    conditionListEl.append(minEl);
                    conditionListEl.append(maxEl);
                    conditionListEl.append(windEl);
                    conditionListEl.append(humidEl);
        
                    forecastDayCardEl.append(forecastDateEl);
                    forecastDayCardEl.append(iconImgEl);
                    forecastDayCardEl.append(conditionSummaryEl);
                    forecastDayCardEl.append(conditionListEl);

                    forecastRootEl.append(forecastDayCardEl);
                }
            })

        // Remove city from search history if it exists in it
        var matches = (element) => element == searchedCity;
        var inListIndex = searchHistoryList.findIndex(matches);
        if (inListIndex >= 0) {
            searchHistoryList.splice(inListIndex, 1);
        }

        // Add city to search history and re-render
        searchHistoryList.unshift(searchedCity);
        localStorage.setItem("history", JSON.stringify(searchHistoryList));
        renderSearchHistory();
    }

    // Function to process the raw weather data into desired format
    function processWeather(rawWeather, timezone) {
        var processedWeather = {
            city: "",
            date: "",
            dateTime: "",
            summary: "",
            iconUrl: "",
            iconUrlBig: "",
            temperature: "",
            tempMin: "",
            tempMax: "",
            windSpeed: "",
            humidity: ""
        };

        // Convert raw data
        processedWeather.city = rawWeather.name;
        processedWeather.summary = rawWeather.weather[0].main;
        processedWeather.temperature = rawWeather.main.temp;
        processedWeather.tempMin= rawWeather.main.temp_min;
        processedWeather.tempMax = rawWeather.main.temp_max;
        processedWeather.windSpeed = rawWeather.wind.speed;
        processedWeather.humidity = rawWeather.main.humidity;

        // Get two copies of the weather icon; one larger to display on the current conditions
        var iconCode = rawWeather.weather[0].icon;
        processedWeather.iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        processedWeather.iconUrlBig = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        // To obtain the date in UTC, we add the timezone difference to the timestamp and convert to UTC string
        // Then slice the string to get the date and time
        var localDate = new Date((rawWeather.dt+timezone)*1000).toUTCString();
        var date = localDate.slice(5, 16);
        var time = localDate.slice(17, 22);
        processedWeather.date = date;
        processedWeather.dateTime = `${time}, ${date}`;

        return processedWeather;
    }

    // Function to render the search history on the page
    function renderSearchHistory() {
        for (let i = 0; i < searchHistoryList.length; i++) {
            searchItemEl = $('<li>');
            searchItemEl.text(searchHistoryList[i]);
            searchItemEl.addClass("search-item")
            searchHistoryRootEl.append(searchItemEl);
        }
    }

    // Function to find the most common item in array
    function mostCommon(array) {
        // Create a dictionary object and count items in the array
        var occurrences = {};
        array.forEach((element) => {
            if(occurrences[element]) {
                occurrences[element]++;
            } else {
                occurrences[element] = 1;
            }
        });

        // Reverse the keys and values in the object
        var occurReverse = Object.fromEntries(Object.entries(occurrences).map(element => element.reverse()));

        // Return the maximum
        return occurReverse[Math.max.apply(null,(Object.values(occurrences)))];
    }

    // API Tests
    if (DEBUG) {
        let testCity = "Perth";
        let testUrl1 = `https://api.openweathermap.org/data/2.5/weather?q=${testCity}&appid=${API_KEY}`;

        fetch(testUrl1)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
            })

        let testUrl2 = `https://api.openweathermap.org/data/2.5/forecast?q=${testCity}&appid=${API_KEY}`;
        
        fetch(testUrl2)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
            console.log(data);
        })
    }
});