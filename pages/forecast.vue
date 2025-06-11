<!-- pages/hourly.vue -->
<script setup lang="ts">
import { onMounted, watch, computed } from "vue";
import { useStorage } from "@vueuse/core";
import HeaderSection from "~/components/sections/HeaderSection.vue";
import countries from "i18n-iso-countries";

import type {
  GeocodeCityResponse,
  ForecastApiResponse,
  ForecastResponse,
  ForecastItem,
} from "~/types/weather";

const selectedCity = useState<GeocodeCityResponse>("selectedCity");
const forecast = ref<ForecastResponse | null>(null);
const isLoading = ref(false);
const error = ref("");

const temperatureUnit = useStorage<"celsius" | "fahrenheit">(
  "temperatureUnit",
  "fahrenheit"
);

const groupedForecast = computed(() => {
  if (!forecast.value) return [];

  let timezone: number = 0;
  if (forecast && forecast.value) {
    timezone = forecast.value.city.timezone;
  } else {
    console.log("Timezone missing");
  }

  function getDayLabel(unixTimestamp: number, timezone: number) {
    const cityLocalTimestampMillis = (unixTimestamp + timezone) * 1000;
    const cityDate = new Date(cityLocalTimestampMillis);

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC", // Already adjusted for city timezone
    };
    return new Intl.DateTimeFormat("en-US", options).format(cityDate);
  }
  const groups: Record<string, ForecastItem[]> = {};
  console.log(forecast.value.list);
  for (const item of forecast.value.list) {
    const day = getDayLabel(item.dt, timezone);
    console.log(day);
    if (!groups[day]) groups[day] = [];
    groups[day].push(item);
  }
  console.log(groups);
  let result = Object.entries(groups).map(([day, items]) => ({
    day,
    items,
  }));
  console.log(result);
  return result;
});

function formatDateTimeForSubheader(unixTimestamp: number): string {
  let timezone: number = 0;
  if (forecast && forecast.value) {
    timezone = forecast.value.city.timezone;
  } else {
    console.log("Timezone missing");
  }

  const cityLocalTimestampMillis = (unixTimestamp + timezone) * 1000;
  const cityDate = new Date(cityLocalTimestampMillis);

  const options: Intl.DateTimeFormatOptions = {    
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC", // Already adjusted for city timezone
  };

  return new Intl.DateTimeFormat("en-US", options).format(cityDate);
}

async function getLoadingForecast(lat: number, lon: number) {
  isLoading.value = true;
  await getForecast(lat, lon);
  isLoading.value = false;
}

async function getForecast(lat: number, lon: number) {
  if (!lat || !lon) return;

  forecast.value = null;
  try {
    const fetchRes = await $fetch<ForecastApiResponse>(
      "/api/weather/forecast",
      {
        method: "POST",
        body: {
          lat: lat,
          lon: lon,
        },
      }
    );

    if (fetchRes && fetchRes.success) {
      forecast.value = fetchRes.response;
      error.value = "";
    } else {
      error.value = fetchRes.errorMessage || "Failed to fetch hourly forecast.";
    }
  } catch (err) {
    error.value = "API error.";
    console.error(err);
  }
}

onMounted(() => {
  if (selectedCity && selectedCity.value) {
    getLoadingForecast(selectedCity.value.lat, selectedCity.value.lon);
  }
});

watch(selectedCity, (newValue) => {
  if (!newValue) {
    forecast.value = null;
  } else {
    getLoadingForecast(newValue.lat, newValue.lon);
  }
});

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
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
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
      v-if="isLoading"
      class="bg-[var(--surface)] border border-[var(--border)] shadow-lg rounded-xl text-[var(--txt)] p-6 mt-6 flex items-center justify-center"
    >
      <div class="loader"></div>
    </div>

    <div
      v-if="forecast && !isLoading"
      class="bg-[var(--surface)] border border-[var(--border)] shadow-lg rounded-xl text-[var(--txt)] p-6 mt-6"
    >
      <h2 class="text-2xl font-bold mb-4 flex items-center gap-2 flex-wrap">
        <span>{{ forecast.city.name }}</span>
        <span class="text-lg text-gray-400"
          >({{ countries.getName(forecast.city.country, "en") ?? "" }})</span
        >
        <span class="text-sm text-gray-400"
          >({{ forecast.city.coord.lat.toFixed(4) }},
          {{ forecast.city.coord.lon.toFixed(4) }})</span
        >
      </h2>

      <UAccordion
        :items="groupedForecast"
        item-key="day"
        class="border-0 shadow-none bg-transparent"
        :ui="{ trailingIcon: '', trigger: 'w-full px-0 py-0', content: 'p-0' }"
      >
        <template #default="{ item: group, open }">
          <div class="font-bold text-lg py-3">{{ group.day }}</div>
        </template>

        <template #content="{ item: group }">
          <UAccordion
            :items="
              group.items.map((item) => ({
                label:
                  formatDateTimeForSubheader(item.dt) +
                  ' - ' +
                  item.weather[0].description +
                  ' (' +
                  displayTemperature(item.main.temp) +
                  ')',
                forecastData: item,
              }))
            "
            :ui="{
              trailingIcon: 'hidden',
              trigger: 'w-full px-0 py-0',
              content: 'p-0',
            }"
          >
            <template #default="slotProps">
              <div
                class="flex items-center justify-between flex-grow px-4 py-2 w-full border-b border-gray-200 dark:border-gray-800"
              >
                <span
                  class="text-base font-bold text-left whitespace-nowrap overflow-hidden text-ellipsis mr-2 flex-none"
                >
                  {{ slotProps.item.label }}
                </span>
                <!-- RIGHT: Icon, temp, weather, etc. (no ml-auto/ms-auto here) -->
                <div
                  class="flex items-center gap-2 flex-shrink-0 ml-auto flex-none"
                >
                  <img
                    :src="`https://openweathermap.org/img/wn/${slotProps.item.forecastData.weather[0].icon}@2x.png`"
                    :alt="slotProps.item.forecastData.weather[0].description"
                    class="w-8 h-8"
                  />
                </div>

                <UIcon
                  name="i-heroicons-chevron-right-20-solid"
                  class="w-5 h-5 transform transition-transform duration-200 min-w-[20px] ml-2"
                  :class="[slotProps.open && 'rotate-90']"
                />
              </div>
            </template>
            <template #content="slotProps">
              <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-thermometer" class="text-base" />
                    <span class="font-bold">Feels like:</span>
                  </div>
                  <span class="font-semibold">
                    {{
                      displayTemperature(
                        slotProps.item.forecastData.main.feels_like
                      )
                    }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-thermometer-snowflake"
                      class="text-base"
                    />
                    <span class="font-bold">Min Temp:</span>
                  </div>
                  <span class="font-semibold">
                    {{
                      displayTemperature(
                        slotProps.item.forecastData.main.temp_min
                      )
                    }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-thermometer-sun" class="text-base" />
                    <span class="font-bold">Max Temp:</span>
                  </div>
                  <span class="font-semibold">
                    {{
                      displayTemperature(
                        slotProps.item.forecastData.main.temp_max
                      )
                    }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-droplets" class="text-base" />
                    <span class="font-bold">Humidity:</span>
                  </div>
                  <span class="font-semibold"
                    >{{ slotProps.item.forecastData.main.humidity }}%</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-circle-gauge" class="text-base" />
                    <span class="font-bold">Pressure:</span>
                  </div>
                  <span class="font-semibold"
                    >{{ slotProps.item.forecastData.main.pressure }} hPa</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-gauge" class="text-base" />
                    <span class="font-bold">Sea Level:</span>
                  </div>
                  <span class="font-semibold"
                    >{{ slotProps.item.forecastData.main.sea_level }} hPa</span
                  >
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-cloudy" class="text-base" />
                    <span class="font-bold">Cloudiness:</span>
                  </div>
                  <span class="font-semibold"
                    >{{ slotProps.item.forecastData.clouds.all }}%</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-wind" class="text-base" />
                    <span class="font-bold">Wind Speed:</span>
                  </div>
                  <span class="font-semibold"
                    >{{ slotProps.item.forecastData.wind.speed }} m/s</span
                  >
                </div>
                <div
                  v-if="slotProps.item.forecastData.wind.deg !== undefined"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-compass" class="text-base" />
                    <span class="font-bold">Wind Dir:</span>
                  </div>
                  <span class="font-semibold"
                    >{{ slotProps.item.forecastData.wind.deg }}° ({{
                      getWindDirection(slotProps.item.forecastData.wind.deg)
                    }})</span
                  >
                </div>
                <div
                  v-if="slotProps.item.forecastData.wind.gust !== undefined"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-arrow-up" class="text-base" />
                    <span class="font-bold">Wind Gust:</span>
                  </div>
                  <span class="font-semibold"
                    >{{ slotProps.item.forecastData.wind.gust }} m/s</span
                  >
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-eye" class="text-base" />
                    <span class="font-bold">Visibility:</span>
                  </div>
                  <span class="font-semibold"
                    >{{
                      slotProps.item.forecastData.visibility / 1000
                    }}
                    km</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-umbrella" class="text-base" />
                    <span class="font-bold">Precip. Prob.:</span>
                  </div>
                  <span class="font-semibold"
                    >{{
                      (slotProps.item.forecastData.pop * 100).toFixed(0)
                    }}%</span
                  >
                </div>

                <div
                  v-if="
                    slotProps.item.forecastData.rain &&
                    slotProps.item.forecastData.rain['3h']
                  "
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-cloud-rain" class="text-base" />
                    <span class="font-bold">Rain (3h):</span>
                  </div>
                  <span class="font-semibold"
                    >{{ slotProps.item.forecastData.rain["3h"] }} mm</span
                  >
                </div>
                <div
                  v-if="
                    slotProps.item.forecastData.snow &&
                    slotProps.item.forecastData.snow['3h']
                  "
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-snowflake" class="text-base" />
                    <span class="font-bold">Snow (3h):</span>
                  </div>
                  <span class="font-semibold"
                    >{{ slotProps.item.forecastData.snow["3h"] }} mm</span
                  >
                </div>
              </div>
            </template>
          </UAccordion>
        </template>
      </UAccordion>
    </div>
  </div>
</template>

<style>
/* HTML: <div class="loader"></div> */
.loader {
  width: fit-content;
  font-size: 40px;
  font-family: monospace;
  font-weight: bold;
  text-transform: uppercase;
  color: #0000;
  -webkit-text-stroke: 1px var(--txt);
  --g: conic-gradient(var(--txt) 0 0) no-repeat text;
  background: var(--g) 0, var(--g) 1ch, var(--g) 2ch, var(--g) 3ch, var(--g) 4ch,
    var(--g) 5ch, var(--g) 6ch;
  animation: l18-0 2s linear infinite alternate, l18-1 4s linear infinite;
}
.loader:before {
  content: "Loading";
}
@keyframes l18-0 {
  0% {
    background-size: 1ch 0, 1ch 0, 1ch 0, 1ch 0, 1ch 0, 1ch 0, 1ch 0;
  }
  14.28% {
    background-size: 1ch 100%, 1ch 50%, 1ch 0, 1ch 0, 1ch 0, 1ch 0, 1ch 0;
  }
  28.57% {
    background-size: 1ch 100%, 1ch 100%, 1ch 50%, 1ch 0, 1ch 0, 1ch 0, 1ch 0;
  }
  42.85% {
    background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 50%, 1ch 0, 1ch 0, 1ch 0;
  }
  57.14% {
    background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 50%, 1ch 0,
      1ch 0;
  }
  71.43% {
    background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 50%,
      1ch 0;
  }
  85.71% {
    background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%,
      1ch 50%;
  }
  100% {
    background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%,
      1ch 100%;
  }
}
@keyframes l18-1 {
  0%,
  50% {
    background-position-y: 100%;
  }
  50.01%,
  to {
    background-position-y: 0;
  }
}
</style>
