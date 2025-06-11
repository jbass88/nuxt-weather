import { openWeatherFetch } from "~/server/utils/weather/openWeatherClient";
import type { GeocodeApiResponse } from "~/types/weather";

export default defineEventHandler(
  async (event): Promise<GeocodeApiResponse> => {
    const path = "/geo/1.0/reverse";
    try {
      const body = await readBody(event);
      if (!body)
        return { success: false, errorMessage: "Request 'body' is required" };

      const lat = body.lat as number | undefined;
      const lon = body.lon as number | undefined;

      if (!lat || !lon)
        return { success: false, errorMessage: "Lat/lon is required" };

      const latString = lat?.toString();
      const lonString = lon?.toString();
      const limit = "5";

      const fetchRes = await openWeatherFetch(path, {
        lat: latString,
        lon: lonString,
        limit,
      });
      if (fetchRes && fetchRes.ok) {
        return { success: true, response: fetchRes.json };
      } else {
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
