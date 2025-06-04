<script setup lang="ts">
import { onMounted, watch } from "vue";
import HeaderSection from "~/components/sections/HeaderSection.vue";
import countries from "i18n-iso-countries";

import type {
  GeocodeCityResponse,
  CurrentApiResponse,
  CurrentResponse,
} from "~/types/weather";
const selectedCity = useState<GeocodeCityResponse>("selectedCity");
const current = ref<CurrentResponse | null>(null);
const error = ref("");

const temperatureUnit = useState<"celsius" | "fahrenheit">("temperatureUnit");

async function getCurrent(lat: number, lon: number) {
  if (!lat || !lon) return;

  current.value = null;
  try {
    const fetchRes = await $fetch<CurrentApiResponse>("/api/weather/current", {
      method: "POST",
      body: {
        lat: lat,
        lon: lon,
      },
    });
    if (fetchRes && fetchRes.success) {
      current.value = fetchRes.response;
      error.value = "";
    } else {
      error.value = fetchRes.errorMessage || "Failed to fetch current weather.";
    }
  } catch (err) {
    error.value = "API error.";
  }
}

onMounted(() => {
  if (selectedCity && selectedCity.value) {
    getCurrent(selectedCity.value.lat, selectedCity.value.lon);
  }
});

watch(selectedCity, (newValue, oldValue) => {
  if (!newValue) {
    current.value = null;
  } else {
    getCurrent(newValue.lat, newValue.lon);
  }
});

function formatCityTime(dt: number, timezone: number) {
  const cityLocalTimestampMillis = (dt + timezone) * 1000;
  const cityDate = new Date(cityLocalTimestampMillis);

  const year = cityDate.getUTCFullYear();
  const month = (cityDate.getUTCMonth() + 1).toString().padStart(2, "0"); 
  const day = cityDate.getUTCDate().toString().padStart(2, "0");

  let hours24 = cityDate.getUTCHours(); 
  const minutes = cityDate.getUTCMinutes().toString().padStart(2, "0");
  const seconds = cityDate.getUTCSeconds().toString().padStart(2, "0");

  const ampm = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12; 
  if (hours12 === 0) {
    hours12 = 12; 
  }
  const displayHours = hours12.toString().padStart(2, "0"); 

  const timeStr = `${displayHours}:${minutes}:${seconds} ${ampm}`;
  const dateStr = `${year}-${month}-${day} ${timeStr}`;

  const offsetHours = timezone / 3600;
  const sign = offsetHours >= 0 ? "+" : "-";
  const absOffsetHours = Math.floor(Math.abs(offsetHours))
    .toString()
    .padStart(2, "0");
  const absOffsetMinutes = Math.abs((timezone % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const offsetStr = `UTC${sign}${absOffsetHours}:${absOffsetMinutes}`;

  return `${dateStr} (${offsetStr})`;
}

function formatTimeOnly(unixTimestamp: number, timezoneOffset: number): string {
  const cityLocalTimestampMillis = (unixTimestamp + timezoneOffset) * 1000;
  const cityDate = new Date(cityLocalTimestampMillis);

  let hours24 = cityDate.getUTCHours();
  const minutes = cityDate.getUTCMinutes().toString().padStart(2, "0");
  const seconds = cityDate.getUTCSeconds().toString().padStart(2, "0");

  const ampm = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) {
    hours12 = 12;
  }
  const displayHours = hours12.toString().padStart(2, "0");

  return `${displayHours}:${minutes}:${seconds} ${ampm}`;
}

function displayTemperature(kelvin: number): string {
  const celsius = kelvin - 273.15;
  if (temperatureUnit.value === "celsius") {
    return `${celsius.toFixed(1)}°C`;
  } else {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  }
}

function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}

</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-12">
    <HeaderSection />

    <UAlert
      v-if="error"
      icon="i-lucide-triangle-alert"
      color="error"
      variant="soft"
      title="Error"
      :description="error"
      close
      @close="error = ''"
      class="mt-6"
    />

    <div
      v-if="current"
      class="bg-[var(--surface)] border border-[var(--border)] shadow-lg rounded-xl text-[var(--txt)] p-6 mt-6"
    >
      <h2 class="text-2xl font-bold mb-4 flex items-center gap-2 flex-wrap">
        <span>{{ current.name }}</span>
        <span class="text-lg text-gray-400"
          >({{ countries.getName(current.sys.country, "en") ?? "" }})</span
        >
        <span class="text-sm text-gray-400"
          >({{ current.coord.lat.toFixed(4) }},
          {{ current.coord.lon.toFixed(4) }})</span
        >
      </h2>

      <div class="mb-6 text-gray-400">
        <span class="font-bold">Last Updated:</span>
        <span class="font-semibold ml-2">{{
          formatCityTime(current.dt, current.timezone)
        }}</span>
      </div>

      <div class="flex flex-col items-center mb-8 text-center">
        <img
          :src="`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`"
          :alt="current.weather[0].description"
          class="w-20 h-20"
        />
        <div>
          <span class="text-5xl font-bold block mb-1">
            {{ displayTemperature(current.main.temp) }}
          </span>
          <div class="text-2xl capitalize text-gray-300">
            {{ current.weather[0].description }}
            <span class="text-gray-500 text-xl"
              >({{ current.weather[0].main }})</span
            >
          </div>
        </div>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-thermometer" class="text-xl" />
            <span class="font-bold">Feels like:</span>
          </div>
          <span class="font-semibold">
            {{ displayTemperature(current.main.feels_like) }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-thermometer-snowflake" class="text-xl" />
            <span class="font-bold">Min Temp:</span>
          </div>
          <span class="font-semibold">
            {{ displayTemperature(current.main.temp_min) }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-thermometer-sun" class="text-xl" />
            <span class="font-bold">Max Temp:</span>
          </div>
          <span class="font-semibold">
            {{ displayTemperature(current.main.temp_max) }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-droplets" class="text-xl" />
            <span class="font-bold">Humidity:</span>
          </div>
          <span class="font-semibold">{{ current.main.humidity }}%</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-circle-gauge" class="text-xl" />
            <span class="font-bold">Pressure:</span>
          </div>
          <span class="font-semibold">{{ current.main.pressure }} hPa</span>
        </div>
        <div></div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-cloudy" class="text-xl" />
            <span class="font-bold">Cloudiness:</span>
          </div>
          <span class="font-semibold">{{ current.clouds.all }}%</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-wind" class="text-xl" />
            <span class="font-bold">Wind Speed:</span>
          </div>
          <span class="font-semibold">{{ current.wind.speed }} m/s</span>
        </div>
        <div
          v-if="current.wind.deg !== undefined"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-compass" class="text-xl" />
            <span class="font-bold">Wind Dir:</span>
          </div>
          <span class="font-semibold">{{ current.wind.deg }}° ({{ getWindDirection(current.wind.deg) }})</span>
        </div>
        <div
          v-if="current.wind.gust !== undefined"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-arrow-up" class="text-xl" />
            <span class="font-bold">Wind Gust:</span>
          </div>
          <span class="font-semibold ml-2">{{ current.wind.gust }} m/s</span>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sunrise" class="text-xl" />
            <span class="font-bold">Sunrise:</span>
          </div>
          <span class="font-semibold">{{
            formatTimeOnly(current.sys.sunrise, current.timezone)
          }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sunset" class="text-xl" />
            <span class="font-bold">Sunset:</span>
          </div>
          <span class="font-semibold">{{
            formatTimeOnly(current.sys.sunset, current.timezone)
          }}</span>
        </div>
        <div></div>

        <div
          v-if="current.rain && current.rain['1h']"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-cloud-rain" class="text-xl" />
            <span class="font-bold">Rain (1h):</span>
          </div>
          <span class="font-semibold">{{ current.rain["1h"] }} mm/h</span>
        </div>
        <div
          v-if="current.snow && current.snow['1h']"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-snowflake" class="text-xl" />
            <span class="font-bold">Snow (1h):</span>
          </div>
          <span class="font-semibold">{{ current.snow["1h"] }} mm/h</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
