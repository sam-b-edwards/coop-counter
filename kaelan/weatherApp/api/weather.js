export const fetchWeatherData = async (city) => {
    try {
        const apiKey = '8e2c4c783d28479a8e4225219250402'
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1&aqi=no&alerts=no`);
        const data = await response.json();
        return data
    } catch (error) {
        throw error
    }
}