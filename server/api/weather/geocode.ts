import { openWeatherFetch } from "~/server/utils/weather/openWeatherClient";
import type { GeocodeApiResponse } from "~/types/weather";

export default defineEventHandler(
  async (event): Promise<GeocodeApiResponse> => {
    const path = "/geo/1.0/direct";
    try {
      const body = await readBody(event);
      if (!body)
        return { success: false, errorMessage: "Request 'body' is required" };

      const city = body.city as string | undefined;
      const state = body.state as string | undefined;
      const country = body.country as string | undefined;

      if (!city) return { success: false, errorMessage: "City is required" };

      let q = city;
      if (state) q += `,${state}`;
      if (country) q += `,${country}`;
      const limit = "5";

      const fetchRes = await openWeatherFetch(path, { q, limit });
      if (fetchRes && fetchRes.ok) {
        return { success: true, response: fetchRes.json };
      } else {
        const fetchUrl = ` ${fetchRes.url}`;
        return {
          success: false,
          response: fetchRes.status + " " + fetchRes.statusText,
          errorMessage: "Invalid response",
        };
      }
    } catch (error) {
      return { success: false, error: error };
    }
  }
);
