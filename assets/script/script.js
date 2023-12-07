$(function () {
    const DEBUG = false;
    const NUM_DAY_FORECAST = 5;
    const API_KEY = "52cc4f6275d043cc0b5b26335cce427e";

    var searchFormEl = $("#search-form");
    var searchInputEl = $("#city-search");
    var currentWeatherRootEl = $("#current-weather");
    var forecastRootEl = $("#forecast");
    var searchHistoryRootEl = $("#search-history");

    var searchHistoryList = [];
    if (localStorage.getItem("history")) {
        searchHistoryList = JSON.parse(localStorage.getItem("history"));
    }
    renderSearchHistory();

    searchFormEl.on("submit", (event) => {
        event.preventDefault();
        searchAndDisplay(searchInputEl.val());
    });

    searchHistoryRootEl.on("click", (event) => {
        event.preventDefault();
        if(event.target.matches(".search-item")) {
            searchAndDisplay($(event.target).text());
        }
    });

    function searchAndDisplay(searchedCity) {
        currentWeatherRootEl.empty();
        forecastRootEl.empty();
        searchHistoryRootEl.empty();

        var apiCurrentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${API_KEY}&units=metric`;
        var apiForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchedCity}&appid=${API_KEY}&units=metric`;
        
        fetch(apiCurrentUrl)
            .then(function (response) {
                return response.json();
            })
            .then(function (currentWeatherRaw) {
                var currentWeatherProcessed = processWeather(currentWeatherRaw, currentWeatherRaw.timezone);

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
                var forecastCardList = []
                for (let i=0; i<forecastRaw.list.length; i++) {
                    var forecastProcessed = processWeather(forecastRaw.list[i], forecastRaw.city.timezone);
                
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
                    currentCard.summary.push(forecastProcessed.summary);
                    currentCard.iconUrl.push(forecastProcessed.iconUrl);
                    currentCard.temp.push(forecastProcessed.temperature);
                    currentCard.wind.push(forecastProcessed.windSpeed);
                    currentCard.humid.push(forecastProcessed.humidity);
                }

                while (forecastCardList.length > NUM_DAY_FORECAST) {
                    forecastCardList.shift();
                }

                for (let i=0; i<NUM_DAY_FORECAST; i++) {
                    var forecastDayCardEl = $('<article>')
                    var forecastDateEl = $('<p>');
                    var iconImgEl = $('<img>');
                    var conditionSummaryEl = $('<p>');
                    var conditionListEl = $('<ul>');
                    var minEl = $('<li>');
                    var maxEl = $('<li>');
                    var windEl = $('<li>');
                    var humidEl = $('<li>');

                    forecastDateEl.text(forecastCardList[i].date);
                    conditionSummaryEl.text(mostCommon(forecastCardList[i].summary));
                    iconImgEl.attr("src", mostCommon(forecastCardList[i].iconUrl));
                    
                    minEl.text(`Min Temp: ${Math.min.apply(null, forecastCardList[i].temp)}°C`);
                    maxEl.text(`Max Temp: ${Math.max.apply(null, forecastCardList[i].temp)}°C`);
                    windEl.text(`Max Wind: ${Math.max.apply(null, forecastCardList[i].wind)}km/h`);
                    humidEl.text(`Max Humid: ${Math.max.apply(null, forecastCardList[i].humid)}%`);
        
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

        // remove city from search history if it exists in it
        var matches = (element) => element == searchedCity;
        var inListIndex = searchHistoryList.findIndex(matches);
        if (inListIndex >= 0) {
            searchHistoryList.splice(inListIndex, 1);
        }
        // add city to search history
        searchHistoryList.unshift(searchedCity);
        localStorage.setItem("history", JSON.stringify(searchHistoryList));
        // re-render search history
        renderSearchHistory();
    }

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
        
        var localDate = new Date((rawWeather.dt+timezone)*1000).toUTCString();
        var date = localDate.slice(5, 16);
        var time = localDate.slice(17, 22);
        processedWeather.date = date;
        processedWeather.dateTime = `${time}, ${date}`;

        return processedWeather;
    }

    function renderSearchHistory() {
        for (let i = 0; i < searchHistoryList.length; i++) {
            searchItemEl = $('<li>');
            searchItemEl.text(searchHistoryList[i]);
            searchItemEl.addClass("search-item")
            searchHistoryRootEl.append(searchItemEl);
        }
    }

    function mostCommon(array) {
        var occurrences = {};
        array.forEach((element) => {
            if(occurrences[element]) {
                occurrences[element]++;
            } else {
                occurrences[element] = 1;
            }
        });
        var occurReverse = Object.fromEntries(Object.entries(occurrences).map(element => element.reverse()));
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