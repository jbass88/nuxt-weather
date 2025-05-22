<script setup lang="ts">
import { ref } from 'vue'
import Multiselect from 'vue-multiselect'
import type { GeocodeApiResponse, GeocodeCityResponse, CurrentApiResponse, CurrentResponse, ForecastApiResponse, ForecastResponse } from '~/types/weather'
import countries from 'i18n-iso-countries'

const error = ref('')

const isLoading = ref(false)
const location = ref<GeocodeCityResponse | null>(null)
const storedLocation = ref<GeocodeCityResponse | null>(null)
const options = ref<GeocodeCityResponse[]>([])
const current = ref<CurrentResponse | null>(null)
const forecast = ref<ForecastResponse | null>(null)

function customLabel(input : GeocodeCityResponse) {
    let output = `${input.city}`
    if (input.state)
        output += `, ${input.state}`
    if (input.country)
        output += `, ${input.country}`
    return output
}

async function getCurrent(lat: string, lon: string) {
    if (!lat || !lon) return

    current.value = null
    try {
        const fetchRes = await $fetch<CurrentApiResponse>('/api/weather/current', {
        method: 'POST',
        body: {
            lat:    lat,
            lon:    lon
        },})
        if (fetchRes && fetchRes.success) {
            current.value = fetchRes.response
            error.value = ''
        }
        else {
            error.value = "Current failed."
        }
    } 
    catch (err) {
        error.value = "API error."
        console.error(err)
    }
}

async function getForecast(lat: string, lon: string) {
    if (!lat || !lon) return

    forecast.value = null
    try {
        const fetchRes = await $fetch<ForecastApiResponse>('/api/weather/forecast', {
        method: 'POST',
        body: {
            lat:    lat,
            lon:    lon
        },})

        if (fetchRes && fetchRes.success) {
            forecast.value = fetchRes.response
            error.value = ''
        }
        else {
            error.value = "Forecast failed."
        }
    } 
    catch (err) {
        error.value = "API error."
        console.error(err)
    }
}

async function geocodeLocation(query : string) {
    isLoading.value = true

    location.value = null
    options.value = []

    if (!query) {
        isLoading.value = false
        return
    }

    try {
        const fetchRes = await $fetch<GeocodeApiResponse>('/api/weather/geocode', {
        method: 'POST',
        body: {
            city:   query,
        },})
        if (fetchRes && fetchRes.success) {
            const responseObjs = fetchRes.response
            if (responseObjs.length >= 1) {
                for (var i = 0; i < responseObjs.length; i++) {
                    const responseCity = responseObjs[i].name
                    const responseState =  responseObjs[i].state ?? ''
                    let responseCountry = responseObjs[i].country ?? ''
                    if (responseCountry) {
                        let countryName = countries.getName(responseObjs[i].country, "en")
                        if (countryName) 
                            responseCountry = countryName
                    }
                    const responseLat = responseObjs[i].lat ?? 0.0
                    const responseLon = responseObjs[i].lon ?? 0.0
                    const responseKey = i.toString()
                    options.value.push({key: responseKey, city: responseCity, state: responseState, country: responseCountry, lat: responseLat, lon: responseLon})
                }
            }
        }
    } 
    catch (err) {
        console.error(err)
    }
    isLoading.value = false
}

function handleGetWeather(event: Event) {
    event.preventDefault(); 
    if (storedLocation.value && storedLocation.value.lat && storedLocation.value.lon) {
        getCurrent(String(storedLocation.value.lat), String(storedLocation.value.lon))
    } else {
        error.value = "Please select a city from the list."
    }
}

function handleGetForecast(event: Event) {
    event.preventDefault(); 
    if (storedLocation.value && storedLocation.value.lat && storedLocation.value.lon) {
        getForecast(String(storedLocation.value.lat), String(storedLocation.value.lon))
    } else {
        error.value = "Please select a city from the list."
    }
}

function selectLocation(location: GeocodeCityResponse) {
    if (location)
        storedLocation.value = location
}
</script>

<template>
  <div class="max-w-xl mx-auto p-8 space-y-8">
    <!-- Title -->
    <h1 class="text-4xl font-bold mb-6 text-center">Weather App</h1>

    <!-- Input and Buttons -->
    <div class="flex flex-col gap-4 items-center">
      <Multiselect
        v-model="location"
        :options="options"
        :allow-empty="false"
        track-by="key"
        label="city"
        :custom-label="customLabel"
        :show-labels="false"
        :internal-search="false"
        :loading="isLoading"
        @search-change="geocodeLocation"
        @select="selectLocation"
        placeholder="City (e.g. London)"
        deselect-label="Can't remove this value"
        class="w-full"
      >
        <template v-slot:singleLabel="{ option }">
          {{ option.city }}<span v-if="option.state">, {{ option.state }}</span><span v-if="option.country">, {{ option.country }}</span>
        </template>
      </Multiselect>
      <div class="flex gap-4 w-full justify-center">
        <button class="bg-teal-600 hover:bg-teal-700 transition text-white px-4 py-2 rounded shadow" @click="handleGetWeather">
          Get Current
        </button>
        <button class="bg-teal-500 hover:bg-teal-600 transition text-white px-4 py-2 rounded shadow" @click="handleGetForecast">
          Get Forecast
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="text-red-500 bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-700 rounded p-3 text-center">
      {{ error }}
    </div>

    <!-- Current Weather Card -->
    <div v-if="current" class="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mt-6">
      <h2 class="text-2xl font-bold mb-2 flex items-center gap-2">
        <span>{{ current.name }}</span>
        <span class="text-lg text-gray-400">({{ current.sys.country }})</span>
      </h2>
      <div class="flex items-center mb-4 gap-4">
        <img
          :src="`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`"
          :alt="current.weather[0].description"
          class="w-16 h-16"
        />
        <span class="text-4xl font-bold">
          {{ (current.main.temp - 273.15).toFixed(1) }}°C
        </span>
      </div>
      <div class="text-lg space-y-1">
        <div class="capitalize">{{ current.weather[0].description }}</div>
        <div>Feels like: <span class="font-semibold">{{ (current.main.feels_like - 273.15).toFixed(1) }}°C</span></div>
        <div>Humidity: <span class="font-semibold">{{ current.main.humidity }}%</span></div>
        <div>Wind: <span class="font-semibold">{{ current.wind.speed }} m/s</span></div>
      </div>
    </div>

    <!-- Forecast Table Card -->
    <div v-if="forecast" class="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mt-6">
      <h2 class="text-xl font-bold mb-4">
        {{ forecast.city.name }}, {{ forecast.city.country }} <span class="text-gray-400">(Forecast)</span>
      </h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse rounded-xl overflow-hidden shadow">
          <thead class="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th class="px-2 py-1">Date/Time</th>
              <th class="px-2 py-1">Icon</th>
              <th class="px-2 py-1">Temp (°C)</th>
              <th class="px-2 py-1">Feels</th>
              <th class="px-2 py-1">Weather</th>
              <th class="px-2 py-1">Humidity</th>
              <th class="px-2 py-1">Rain (mm)</th>
              <th class="px-2 py-1">Wind (m/s)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, idx) in forecast.list"
              :key="item.dt"
              :class="idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/40' : ''"
              class="hover:bg-gray-100 dark:hover:bg-gray-800/60"
            >
              <td class="px-2 py-1 whitespace-nowrap">
                {{ new Date(item.dt_txt).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) }}
              </td>
              <td class="px-2 py-1">
                <img
                  :src="`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`"
                  :alt="item.weather[0].description"
                  class="w-8 h-8 mx-auto"
                />
              </td>
              <td class="px-2 py-1 text-center">{{ (item.main.temp - 273.15).toFixed(1) }}</td>
              <td class="px-2 py-1 text-center">{{ (item.main.feels_like - 273.15).toFixed(1) }}</td>
              <td class="px-2 py-1 capitalize text-center">{{ item.weather[0].description }}</td>
              <td class="px-2 py-1 text-center">{{ item.main.humidity }}%</td>
              <td class="px-2 py-1 text-center">
                {{ item.rain && item.rain['3h'] ? item.rain['3h'] : '—' }}
              </td>
              <td class="px-2 py-1 text-center">{{ item.wind.speed }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
