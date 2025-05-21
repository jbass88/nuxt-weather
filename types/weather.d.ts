export interface GeocodeApiResponse {
  success: boolean
  response?: any
  errorMessage?: string
  error?: any
}

export type GeocodeCityResponse = {
  key: string
  city: string
  state: string
  country: string
  lat: number
  lon: number
}

export interface CurrentApiResponse {
  success: boolean
  response?: any
  errorMessage?: string
  error?: any
}

export interface CurrentResponse {
  coord: { lon: number; lat: number };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: { '1h'?: number };
  clouds: { all: number };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastApiResponse {
  success: boolean
  response?: any
  errorMessage?: string
  error?: any
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: ForecastCity;
}

export interface ForecastItem {
  dt: number;
  main: ForecastMain;
  weather: ForecastWeather[];
  clouds: ForecastClouds;
  wind: ForecastWind;
  visibility: number;
  pop: number;
  rain?: ForecastRain;
  snow?: ForecastSnow;
  sys: ForecastSys;
  dt_txt: string;
}

export interface ForecastMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

export interface ForecastWeather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface ForecastClouds {
  all: number;
}

export interface ForecastWind {
  speed: number;
  deg: number;
  gust: number;
}

export interface ForecastRain {
  ['3h']: number;
}

export interface ForecastSnow {
  ['3h']: number;
}

export interface ForecastSys {
  pod: 'd' | 'n';
}

export interface ForecastCity {
  id: number;
  name: string;
  coord: ForecastCoord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastCoord {
  lat: number;
  lon: number;
}