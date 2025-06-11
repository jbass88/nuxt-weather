<script setup lang="ts">
import { useColorMode, useStorage } from "@vueuse/core";

import type { GeocodeCityResponse } from "~/types/weather";
const selectedCity = useState<GeocodeCityResponse>("selectedCity");
const mode = useColorMode();
const temperatureUnit = useStorage<"celsius" | "fahrenheit">(
  "temperatureUnit",
  () => "fahrenheit"
);

const userLocation = useState<{ lat: number; lon: number } | null>(
  "userLocation",
  () => null
);
const locationError = ref<string | null>(null);

function requestLocation() {
  if (!navigator.geolocation) {
    locationError.value = "Geolocation is not supported by your browser.";
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
      locationError.value = null;
    },
    (error) => {
      // Handle errors: error.PERMISSION_DENIED, etc.
      switch (error.code) {
        case error.PERMISSION_DENIED:
          locationError.value = "Permission denied.";
          break;
        case error.POSITION_UNAVAILABLE:
          locationError.value = "Location unavailable.";
          break;
        case error.TIMEOUT:
          locationError.value = "Location request timed out.";
          break;
        default:
          locationError.value = "An unknown error occurred.";
      }
    }
  );
}

function toggleTemperatureUnit() {
  temperatureUnit.value =
    temperatureUnit.value === "celsius" ? "fahrenheit" : "celsius";
}
</script>

<template>
  <header
    class="w-full border-b border-gray-300 dark:border-white/10 sticky top-0 z-50 backdrop-blur"
  >
    <UContainer class="flex items-center justify-between py-3">
      <NuxtLink
        to="/"
        class="hidden md:flex items-center gap-2 text-xl font-bold"
      >
        Weather<span class="text-teal-400">UI</span>
      </NuxtLink>

      <nav class="hidden md:flex gap-6">
        <NuxtLink to="/" class="hover:text-teal-400">Home</NuxtLink>
        <NuxtLink v-if="selectedCity" to="/current" class="hover:text-teal-400"
          >Current</NuxtLink
        >
        <NuxtLink v-if="selectedCity" to="/forecast" class="hover:text-teal-400"
          >Forecast</NuxtLink
        >
        <NuxtLink v-if="selectedCity" to="/map" class="hover:text-teal-400"
          >Map</NuxtLink
        >
      </nav>
      <nav
        class="flex md:hidden justify-center gap-6 px-2 py-3 border-b border-gray-300 dark:border-white/10 bg-background/90 sticky top-[60px] z-40"
      >
        <NuxtLink
          v-if="selectedCity"
          to="/current"
          class="hover:text-teal-400 font-medium"
          active-class="text-teal-400"
          >Current</NuxtLink
        >
        <NuxtLink
          v-if="selectedCity"
          to="/forecast"
          class="hover:text-teal-400 font-medium"
          active-class="text-teal-400"
          >Forecast</NuxtLink
        >
        <NuxtLink
          v-if="selectedCity"
          to="/map"
          class="hover:text-teal-400 font-medium"
          active-class="text-teal-400"
          >Map</NuxtLink
        >
      </nav>

      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          size="sm"
          @click="toggleTemperatureUnit"
          :title="`Switch to ${
            temperatureUnit === 'celsius' ? 'Fahrenheit' : 'Celsius'
          }`"
        >
          <span class="text-lg font-semibold">{{
            temperatureUnit === "celsius" ? "°C" : "°F"
          }}</span>
        </UButton>

        <UButton
          icon="i-lucide-locate-fixed"
          variant="ghost"
          size="sm"
          @click="requestLocation"
        />

        <ClientOnly>
          <UButton
            :icon="mode === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'"
            variant="ghost"
            size="sm"
            @click="mode = mode === 'dark' ? 'light' : 'dark'"
          />
        </ClientOnly>
      </div>
    </UContainer>
  </header>
</template>
