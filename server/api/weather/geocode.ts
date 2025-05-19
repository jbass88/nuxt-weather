import { openWeatherFetch } from "~/server/utils/weather/openWeatherClient";
import type { GeocodeApiResponse } from '~/types/weather'

export default defineEventHandler(async (event): Promise<GeocodeApiResponse> => {
    const path = '/geo/1.0/direct'
    let log = "Log: " + path
    try {
        const body = await readBody(event)
        if (!body)
            return { url: log, success: false, errorMessage: "Request 'body' is required" }

        log += " Body passed"
        const city = body.city as string | undefined
        const state = body.state as string | undefined
        const country = body.country as string | undefined

        if (!city)
            return { url: log, success: false, errorMessage: "City is required" }
        
        log += " City passed"
        let q = city
        if (state) q += `,${state}`
        if (country) q += `,${country}`
        const limit = '5';

        log += " q passed"

        const fetchRes = await openWeatherFetch(path, {q, limit})
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