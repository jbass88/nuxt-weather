<script setup lang="ts">
import { ref } from 'vue'
import Multiselect from 'vue-multiselect'
import type { GeocodeApiResponse, GeocodeCityResponse, CurrentResponse } from '~/types/weather'

const error = ref('')

const isLoading = ref(false)
const value = ref<GeocodeCityResponse | null>(null)
const options = ref<GeocodeCityResponse[]>([])
const current = ref<CurrentResponse | null>(null)

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

    try {
        const fetchRes = await $fetch<GeocodeApiResponse>('/api/weather/current', {
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
            error.value = "Weather lookup failed."
            console.log("Response failed")
        }
    } 
    catch (err) {
        error.value = "API error."
        console.error(err)
    }
}

async function geocodeCity(query : string) {
    isLoading.value = true

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
        value.value = null
        if (fetchRes && fetchRes.success) {
            const responseObjs = fetchRes.response
            if (responseObjs.length >= 1) {
                for (var i = 0; i < responseObjs.length; i++) {
                    const responseCity = responseObjs[i].name
                    const responseState =  responseObjs[i].state ?? ''
                    const responseCountry = responseObjs[i].country ?? ''
                    const responseLat = responseObjs[i].lat ?? 0.0
                    const responseLon = responseObjs[i].lon ?? 0.0
                    const responseKey = i.toString()
                    options.value.push({key: responseKey, city: responseCity, state: responseState, country: responseCountry, lat: responseLat, lon: responseLon})
                }
            }
        }
        else {
            console.log("Response failed")
        }
    } 
    catch (err) {
        console.error(err)
    }
    isLoading.value = false
}

function handleGetWeather(event: Event) {
    event.preventDefault(); // Prevent form submit if inside <form>
    if (value.value && value.value.lat && value.value.lon) {
        getCurrent(String(value.value.lat), String(value.value.lon))
    } else {
        error.value = "Please select a city from the list."
    }
}
</script>

<template>
    <div class="max-w-xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-4">Weather App</h1>
    <form class="flex gap-2 mb-4">
        <Multiselect v-model="value" :options="options" :allow-empty="false" 
                     track-by="key" label="city" :custom-label="customLabel" :show-labels="false" :internal-search="false"
                     :loading="isLoading" @search-change="geocodeCity"
                     placeholder="City (i.e. London)" deselect-label="Can't remove this value">
            <template v-slot:singleLabel="{ option }">
                {{ option.city }}<span v-if="option.state">, {{ option.state }}</span><span v-if="option.country">, {{ option.country }}</span>
            </template>

        </Multiselect>
        <button class="bg-teal-600 text-white px-4 py-2 rounded" @click="handleGetWeather">Get Weather</button>
    </form>

    <div v-if="error" class="text-red-500 mb-2">{{ error }}</div>
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
    </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>