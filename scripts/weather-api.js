const API_KEY = '2ff7d0f9334ae18a8a6e8d82f364d9e5';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Recursive function to fetch weather data with retry logic
async function fetchWeatherWithRetry(cityName, retriesLeft = MAX_RETRIES) {
  try {
    const response = await fetch(
      `${API_BASE_URL}?q=${cityName}&appid=${API_KEY}&units=metric`
    );

    const data = await response.json();

    if (data.cod === "404" || data.cod === 404) {
      throw new Error(data.message || 'City not found'); // Throwing and handling exceptions
    }

    if (data.cod !== 200) {
      if (retriesLeft > 0) {
        console.log(`API error, retrying... (${retriesLeft} attempts left)`);
        await delay(RETRY_DELAY);
        return fetchWeatherWithRetry(cityName, retriesLeft - 1); // Recursive call
      } else {
        throw new Error(data.message || 'Failed to fetch weather data');
      }
    }

    return data;
  } catch (error) {
    if (retriesLeft > 0 && !error.message.includes('City not found')) {
      console.log(`Network error, retrying... (${retriesLeft} attempts left)`);
      await delay(RETRY_DELAY);
      return fetchWeatherWithRetry(cityName, retriesLeft - 1); // Recursive call
    }
    throw error;
  }
}

// Fetch weather data for a city (main entry point)
async function getWeatherData(cityName) {
  return fetchWeatherWithRetry(cityName);
}

// Convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9 / 5) + 32);
}