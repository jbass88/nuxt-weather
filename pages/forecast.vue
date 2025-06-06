<!-- pages/hourly.vue -->
<script setup lang="ts">
import { onMounted, watch, computed } from "vue";
import HeaderSection from "~/components/sections/HeaderSection.vue";
import countries from "i18n-iso-countries";

import type {
  GeocodeCityResponse,
  ForecastApiResponse,
  ForecastResponse,
  ForecastItem,
} from "~/types/weather";
import type { AccordionItem } from "@nuxt/ui";

const selectedCity = useState<GeocodeCityResponse>("selectedCity");
const forecast = ref<ForecastResponse | null>(null);
const error = ref("");

const temperatureUnit = useState<"celsius" | "fahrenheit">("temperatureUnit");

function formatDateTimeForHeaderLeft(
  unixTimestamp: number,
  timezoneOffset: number
): string {
  const cityLocalTimestampMillis = (unixTimestamp + timezoneOffset) * 1000;
  const cityDate = new Date(cityLocalTimestampMillis);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC", // Already adjusted for city timezone
  };

  return new Intl.DateTimeFormat("en-US", options).format(cityDate);
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
    getForecast(selectedCity.value.lat, selectedCity.value.lon);
  }
});

watch(selectedCity, (newValue) => {
  if (!newValue) {
    forecast.value = null;
  } else {
    getForecast(newValue.lat, newValue.lon);
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

// Computed property to format data for UAccordion
const formattedForecastItems = computed(() => {
  if (!forecast.value) return [];

  const timezone = forecast.value.city.timezone;

  return forecast.value.list.map((item: ForecastItem) => {
    // Left part of the header: Date, Time, and brief description + temp in parentheses
    const dateTimeAndDesc = formatDateTimeForHeaderLeft(item.dt, timezone);
    const tempInParentheses = displayTemperature(item.main.temp);
    const labelText = `${dateTimeAndDesc} - ${item.weather[0].description} (${tempInParentheses})`;

    return {
      label: labelText, // This will be "Thu, Jun 5, 4:00 PM - light rain (77.0°F)"
      forecastData: item, // Full forecast data for detailed display in the content slot
    };
  });
});
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
      v-if="forecast"
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
        :items="formattedForecastItems"
        :ui="{
          trailingIcon: 'hidden',
          trigger: 'w-full px-0 py-0 gap-0 justify-between',
        }"
      >
        <!-- CUSTOM HEADER SLOT: #item="{ item, open }" -->
        <template #default="{ item, open }">
          <div
            class="flex items-center justify-between flex-grow px-4 py-2 w-full border-b border-gray-200 dark:border-gray-800"
          >
            <span
              class="text-base font-bold text-left whitespace-nowrap overflow-hidden text-ellipsis mr-2 flex-none"
            >
              {{ item.label }}
            </span>
            <!-- RIGHT: Icon, temp, weather, etc. (no ml-auto/ms-auto here) -->
            <div
              class="flex items-center gap-2 flex-shrink-0 ml-auto flex-none"
            >
              <img
                :src="`https://openweathermap.org/img/wn/${item.forecastData.weather[0].icon}@2x.png`"
                :alt="item.forecastData.weather[0].description"
                class="w-8 h-8"
              />
            </div>

            <UIcon
              name="i-heroicons-chevron-right-20-solid"
              class="w-5 h-5 transform transition-transform duration-200 min-w-[20px] ml-2"
              :class="[open && 'rotate-90']"
            />
          </div>
        </template>

        <template #content="{ item }">
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-thermometer" class="text-base" />
                <span class="font-bold">Feels like:</span>
              </div>
              <span class="font-semibold">
                {{ displayTemperature(item.forecastData.main.feels_like) }}
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
                {{ displayTemperature(item.forecastData.main.temp_min) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-thermometer-sun" class="text-base" />
                <span class="font-bold">Max Temp:</span>
              </div>
              <span class="font-semibold">
                {{ displayTemperature(item.forecastData.main.temp_max) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-droplets" class="text-base" />
                <span class="font-bold">Humidity:</span>
              </div>
              <span class="font-semibold"
                >{{ item.forecastData.main.humidity }}%</span
              >
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-circle-gauge" class="text-base" />
                <span class="font-bold">Pressure:</span>
              </div>
              <span class="font-semibold"
                >{{ item.forecastData.main.pressure }} hPa</span
              >
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-gauge" class="text-base" />
                <span class="font-bold">Sea Level Pressure:</span>
              </div>
              <span class="font-semibold"
                >{{ item.forecastData.main.sea_level }} hPa</span
              >
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-cloudy" class="text-base" />
                <span class="font-bold">Cloudiness:</span>
              </div>
              <span class="font-semibold"
                >{{ item.forecastData.clouds.all }}%</span
              >
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-wind" class="text-base" />
                <span class="font-bold">Wind Speed:</span>
              </div>
              <span class="font-semibold"
                >{{ item.forecastData.wind.speed }} m/s</span
              >
            </div>
            <div
              v-if="item.forecastData.wind.deg !== undefined"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-compass" class="text-base" />
                <span class="font-bold">Wind Dir:</span>
              </div>
              <span class="font-semibold"
                >{{ item.forecastData.wind.deg }}° ({{
                  getWindDirection(item.forecastData.wind.deg)
                }})</span
              >
            </div>
            <div
              v-if="item.forecastData.wind.gust !== undefined"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-arrow-up" class="text-base" />
                <span class="font-bold">Wind Gust:</span>
              </div>
              <span class="font-semibold"
                >{{ item.forecastData.wind.gust }} m/s</span
              >
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-eye" class="text-base" />
                <span class="font-bold">Visibility:</span>
              </div>
              <span class="font-semibold"
                >{{ item.forecastData.visibility / 1000 }} km</span
              >
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-umbrella" class="text-base" />
                <span class="font-bold">Precip. Prob.:</span>
              </div>
              <span class="font-semibold"
                >{{ (item.forecastData.pop * 100).toFixed(0) }}%</span
              >
            </div>
            <div></div>
            <!-- Placeholder to maintain grid alignment -->

            <div
              v-if="item.forecastData.rain && item.forecastData.rain['3h']"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-cloud-rain" class="text-base" />
                <span class="font-bold">Rain (3h):</span>
              </div>
              <span class="font-semibold"
                >{{ item.forecastData.rain["3h"] }} mm</span
              >
            </div>
            <div
              v-if="item.forecastData.snow && item.forecastData.snow['3h']"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-snowflake" class="text-base" />
                <span class="font-bold">Snow (3h):</span>
              </div>
              <span class="font-semibold"
                >{{ item.forecastData.snow["3h"] }} mm</span
              >
            </div>
          </div>
        </template>
      </UAccordion>
    </div>
  </div>
</template>

<style></style>
