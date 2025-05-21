export const fetchData = async (endpoint) => {
    try {
        const response = await fetch(`http://coopcounter.comdevelopment.com/${endpoint}`);
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error)
    } 
}