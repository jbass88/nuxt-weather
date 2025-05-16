<script setup lang="ts">
import { ref } from 'vue'

const city = ref('')
const weather = ref(null)
const error = ref('')

async function getWeather() {
    if (!city.value) {
        alert('Enter city name')
        return
    }

    try {
        const response = await $fetch('/api/weather', {
        method: 'POST',
        body: {
        city:   city.value,
        },})

        console.log("Client Response: ")
        console.log(response)
        if (response && response.success) {
            console.log("Success")
        }
        else {
            alert('Something went wrong. The response was blank.')
            console.log("Failed")
        }
    } 
    catch (err) {
        alert('Something went wrong. There was an error.')
        console.error(err)
    }
}

</script>

<template>
    <div class="max-w-xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-4">Weather App</h1>
    <form @submit.prevent="getWeather" class="flex gap-2 mb-4">
        <input v-model="city" class="border p-2 flex-1 rounded" placeholder="Enter city (e.g., Biloxi)" />
        <button class="bg-teal-600 text-white px-4 py-2 rounded" type="submit">Get Weather</button>
    </form>

    <div v-if="error" class="text-red-500 mb-2">{{ error }}</div>
        <div v-if="weather">
        </div>
    </div>
</template>