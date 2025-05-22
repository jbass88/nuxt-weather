const BASE_URL = 'https://api.openweathermap.org';

export async function openWeatherFetch(path: string, params: Record<string, string>) {
    const config = useRuntimeConfig()
    const apiKey = config.openWeatherApiKey
    if (!apiKey) 
        throw new Error("Missing OpenWeatherMap API key");

    const urlParams = new URLSearchParams({ ...params, appid: apiKey });
    const url = `${BASE_URL}${path}?${urlParams}`;

    const res = await fetch(url);
    const json = await res.json();

    return { ok: res.ok, status: res.status, json, url, statusText: res.statusText };
}
