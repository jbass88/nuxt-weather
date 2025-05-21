import { openWeatherFetch } from "~/server/utils/weather/openWeatherClient";
import type { ForecastApiResponse } from '~/types/weather'

export default defineEventHandler(async (event): Promise<ForecastApiResponse> => {
    const path = '/data/2.5/forecast'
    try {
        const body = await readBody(event)
        if (!body)
            return { success: false, errorMessage: "Request 'body' is required" }

        const lat = body.lat
        const lon = body.lon
        if (!lat || !lon)
            return { success: false, errorMessage: "Missing lat/lon" }

        const fetchRes = await openWeatherFetch(path, { lat, lon })
        if (fetchRes && fetchRes.ok) {
            return { success: true, response: fetchRes.json }
        } else {
            return {
                success: false,
                response: fetchRes ? fetchRes.status + ' ' + fetchRes.statusText : null,
                errorMessage: "Invalid response"
            }
        }
    }
    catch (error) {
        return { success: false, error: error }
    }
});
