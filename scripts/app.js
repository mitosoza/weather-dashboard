// Elements
const addCityBtn = document.getElementById('addCityBtn');
const cityInput = document.getElementById('cityInput');
const citiesGrid = document.getElementById('citiesGrid');
const tempToggle = document.getElementById('tempToggle');

// Array to store saved cities
let savedCities = [];

// Temperature unit state (false = Fahrenheit, true = Celsius)
let isCelsius = false;

// LocalStorage keys
const STORAGE_KEY = 'weatherDashboard_cities';
const TEMP_UNIT_KEY = 'weatherDashboard_tempUnit';

// Save cities to localStorage
function saveCitiesToStorage() {
    const cityNames = savedCities.map(city => city.name); // Native Array ES6 function
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cityNames));
}

// Load cities from localStorage
function loadCitiesFromStorage() {
    try {
        const storedCities = localStorage.getItem(STORAGE_KEY);
        if (storedCities) {
            const cityNames = JSON.parse(storedCities);
            cityNames.forEach(cityName => { // Native Array ES6 function
                addCity(cityName, true);
            });
        }
    } catch (error) {
        console.error('Error loading cities from storage:', error); // Throwing and handling exceptions
    }
}

// Get formatted temperature based on current unit
function getFormattedTemperature(tempCelsius) {
    if (isCelsius) {
        return `${Math.round(tempCelsius)}°C`;
    } else {
        return `${celsiusToFahrenheit(tempCelsius)}°F`;
    }
}

// Get temperature value without unit symbol
function getTemperatureValue(tempCelsius) {
    if (isCelsius) {
        return Math.round(tempCelsius);
    } else {
        return celsiusToFahrenheit(tempCelsius);
    }
}

// Create a city tile element
function createCityTile(weatherData) {
    const tile = document.createElement('div');
    tile.className = 'city-tile';
    tile.dataset.cityId = weatherData.id;
    tile.dataset.tempCelsius = weatherData.main.temp;

    const iconCode = weatherData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const humidity = weatherData.main.humidity;

    // Use Day.js to format the current time
    const lastUpdated = dayjs().format('MMM D, YYYY h:mm A');

    tile.innerHTML = `
    <button class="remove-btn" onclick="removeCity(${weatherData.id})">×</button>
    <h2>${weatherData.name}</h2>
    <img src="${iconUrl}" alt="${weatherData.weather[0].description}" class="weather-icon">
    <div class="temperature">${getFormattedTemperature(weatherData.main.temp)}</div>
    <div class="weather-info">${weatherData.weather[0].main}</div>
    <div class="weather-details">
      <span class="detail-item">Humidity: ${humidity}%</span>
    </div>
    <div class="last-updated">Updated: ${lastUpdated}</div>
  `;

    return tile;
}

// Update all temperature displays
function updateAllTemperatures() {
    const tiles = document.querySelectorAll('.city-tile');
    tiles.forEach(tile => { // Native Array ES6 function
        const tempCelsius = parseFloat(tile.dataset.tempCelsius);
        const tempElement = tile.querySelector('.temperature');

        if (tempElement && !isNaN(tempCelsius)) {
            tempElement.textContent = getFormattedTemperature(tempCelsius);
        }
    });
}

// Add city to the dashboard
async function addCity(cityName, isLoadingFromStorage = false) {
    try {
        if (!isLoadingFromStorage) {
            addCityBtn.disabled = true;
            addCityBtn.innerHTML = '<span>Loading...</span>';
        }

        // Fetch weather data
        const weatherData = await getWeatherData(cityName);

        if (savedCities.some(city => city.id === weatherData.id)) {
            if (!isLoadingFromStorage) {
                alert('This city is already on your dashboard!');
            }
            return;
        }
        savedCities.push(weatherData);
        const tile = createCityTile(weatherData);
        citiesGrid.appendChild(tile);
        saveCitiesToStorage();

        if (!isLoadingFromStorage) {
            cityInput.value = '';
        }

    } catch (error) {
        if (!isLoadingFromStorage) {
            alert(`Error: ${error.message}. Please check the city name and try again.`); // Throwing and handling exceptions
        } else {
            console.error(`Error loading city ${cityName}:`, error.message); // Throwing and handling exceptions
        }
    } finally {
        if (!isLoadingFromStorage) {
            addCityBtn.disabled = false;
            addCityBtn.innerHTML = '<span class="plus-icon">+</span><span>Add City</span>';
        }
    }
}

// Remove city from dashboard
function removeCity(cityId) {
    savedCities = savedCities.filter(city => city.id !== cityId);
    const tile = document.querySelector(`[data-city-id="${cityId}"]`);
    if (tile) {
        tile.remove();
    }
    saveCitiesToStorage();
}

// Handle Add City button click
addCityBtn.addEventListener('click', () => {
    const cityName = cityInput.value.trim();
    if (cityName) {
        addCity(cityName);
    } else {
        alert('Please enter a city name');
    }
});

// Allow Enter key to submit
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addCityBtn.click();
    }
});

// Handle temperature toggle
tempToggle.addEventListener('change', () => {
    isCelsius = tempToggle.checked;
    updateAllTemperatures();
    localStorage.setItem(TEMP_UNIT_KEY, isCelsius ? 'celsius' : 'fahrenheit');
});

// Load temperature unit preference
function loadTemperatureUnit() {
    const savedUnit = localStorage.getItem(TEMP_UNIT_KEY);
    if (savedUnit === 'celsius') {
        isCelsius = true;
        tempToggle.checked = true;
    } else {
        isCelsius = false;
        tempToggle.checked = false;
    }
}

// Load saved cities when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTemperatureUnit();
    loadCitiesFromStorage();
});