import { openWeatherFetch } from "~/server/utils/weather/openWeatherClient";

export default defineEventHandler(async (event) => {
    const path = '/data/2.5/weather'
    let log = "Log: " + path
    try {
        const body = await readBody(event)
        if (!body)
            return { url: path, success: false, errorMessage: "Request 'body' is required" }
        
        log += " Body passed"
        const lat = body.lat;
        const lon = body.lon;
        if (!lat || !lon) 
            return { url: path, success: false, errorMessage: "Missing lat/lon" }

        log += " Lat/lon passed"

        const fetchRes = await openWeatherFetch(path, { lat, lon })
        log += " Fetch passed"
        if (fetchRes && fetchRes.ok) {
            log += ' Fetch Request'
            return { url: log, success: true, response: fetchRes.json }
        }            
        else {
            const fetchUrl = ` ${fetchRes.url}`;
            return { url: log, success: false, response: fetchRes.status + ' ' + fetchRes.statusText, errorMessage: "Invalid response" }
        }
    }
    catch (error) {
        return { url: path, success: false, error: error }
    }    
});
