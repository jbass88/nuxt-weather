export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        if (body && body.city) {
            const city  = body.city
            const encodedCity = encodeURIComponent(city)

            const config = useRuntimeConfig()
            const apiKey = config.openWeatherApiKey
            // const url = 'https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&units=imperial&appid=${apiKey}'
            const url = 'https://api.openweathermap.org/data/2.5/weather?lat=44.34&lon=10.99&appid={apiKey}'
            const response = await $fetch(url)

            console.log("Server Response: " + response)
            if (response) {
                return { success: true, response }
            }
            else {
                return { success: false, response: response, errorMessage: "Invalid response" }
            }
        }
        else {
            return { success: false, errorMessage: "Invalid city" }
        }        
    } catch (error) {
        return { success: false, error: error }
    }
})