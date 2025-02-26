import { apiKey } from "../constants";

const forecastEndpoint = (params) =>
  `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=4&aqi=no&alerts=no`;

const locationEndpoint = (params) =>
  `http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;


const apiCall = async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// Function to fetch the weather forecast
const fetchWeatherForecast = (params) => {
  const forecastUrl = forecastEndpoint(params);
  return apiCall(forecastUrl);
};

// Function to fetch location details
const fetchlocation = (params) => {
  const locationUrl = locationEndpoint(params);
  return apiCall(locationUrl);
};

export {fetchlocation,fetchWeatherForecast};
