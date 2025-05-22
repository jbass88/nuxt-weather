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
    <div class="max-w-xl mx-auto p-8">
        <h1 class="text-3xl font-bold mb-4">Weather App</h1>
        <Multiselect v-model="location" :options="options" :allow-empty="false" 
                    track-by="key" label="city" :custom-label="customLabel" :show-labels="false" :internal-search="false"
                    :loading="isLoading" @search-change="geocodeLocation" @select="selectLocation"
                    placeholder="City (i.e. London)" deselect-label="Can't remove this value">
            <template v-slot:singleLabel="{ option }">
                {{ option.city }}<span v-if="option.state">, {{ option.state }}</span><span v-if="option.country">, {{ option.country }}</span>
            </template>

        </Multiselect>
        <button class="bg-teal-600 text-white px-4 py-2 rounded" @click="handleGetWeather">Get Current</button>
        <button class="bg-teal-600 text-white px-4 py-2 rounded" @click="handleGetForecast">Get Forecast</button>
        <div v-if="error" class="text-red-500 mb-2">{{ error }}</div>
        <div v-if="storedLocation">
            <h2 class="text-xl font-bold mb-2">{{ storedLocation.city }}, {{ storedLocation.country }}</h2>
        </div>
        <div v-if="current">
            <h2 class="text-xl font-bold mb-2">{{ current.name }}, {{ current.sys.country }}</h2>
            <div class="flex items-center mb-2">
                <img :src="`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`" 
                    :alt="current.weather[0].description" 
                    class="w-12 h-12 mr-2">
                <span class="text-2xl font-semibold">
                {{ (current.main.temp - 273.15).toFixed(1) }} °C
                </span>
            </div>
            <div>
                <span class="capitalize">{{ current.weather[0].description }}</span>
                <br>
                Feels like: {{ (current.main.feels_like - 273.15).toFixed(1) }} °C
                <br>
                Humidity: {{ current.main.humidity }}%
                <br>
                Wind: {{ current.wind.speed }} m/s
            </div>
        </div>
        <div v-if="forecast" class="mt-8">
            <h2 class="text-xl font-bold mb-2">
                {{ forecast.city.name }}, {{ forecast.city.country }} (Forecast)
            </h2>
            <div class="overflow-x-auto">
                <table class="min-w-full border-collapse">
                <thead>
                    <tr>
                    <th class="px-2 py-1 border-b">Date/Time</th>
                    <th class="px-2 py-1 border-b">Icon</th>
                    <th class="px-2 py-1 border-b">Temp (°C)</th>
                    <th class="px-2 py-1 border-b">Feels</th>
                    <th class="px-2 py-1 border-b">Weather</th>
                    <th class="px-2 py-1 border-b">Humidity</th>
                    <th class="px-2 py-1 border-b">Rain (mm)</th>
                    <th class="px-2 py-1 border-b">Wind (m/s)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, idx) in forecast.list" :key="item.dt" class="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td class="px-2 py-1 whitespace-nowrap">
                        {{ new Date(item.dt_txt).toLocaleString(undefined, { 
                            weekday: 'short', hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' 
                        }) }}
                    </td>
                    <td class="px-2 py-1">
                        <img
                        :src="`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`"
                        :alt="item.weather[0].description"
                        class="w-8 h-8 mx-auto"
                        />
                    </td>
                    <td class="px-2 py-1 text-center">
                        {{ (item.main.temp - 273.15).toFixed(1) }}
                    </td>
                    <td class="px-2 py-1 text-center">
                        {{ (item.main.feels_like - 273.15).toFixed(1) }}
                    </td>
                    <td class="px-2 py-1 capitalize">
                        {{ item.weather[0].description }}
                    </td>
                    <td class="px-2 py-1 text-center">
                        {{ item.main.humidity }}%
                    </td>
                    <td class="px-2 py-1 text-center">
                        <!-- Only show if rain exists -->
                        {{ item.rain && item.rain['3h'] ? item.rain['3h'] : '—' }}
                    </td>
                    <td class="px-2 py-1 text-center">
                        {{ item.wind.speed }}
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>