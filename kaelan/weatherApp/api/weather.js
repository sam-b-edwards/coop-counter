export const fetchWeatherData = async (city) => {
    try {
        const apiKey = '44a7893e5c3a41e780490710242606'
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1&aqi=no&alerts=no`);
        const data = await response.json();
        return data
    } catch (error) {
        throw error
    }
}