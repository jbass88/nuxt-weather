<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import type { GeocodeCityResponse } from "~/types/weather";
const selectedCity = useState<GeocodeCityResponse>("selectedCity");
const mode = useColorMode();
const temperatureUnit = useState<"celsius" | "fahrenheit">(
  "temperatureUnit",
  () => "celsius"
);

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
      <NuxtLink  to="/" class="flex items-center gap-2 text-xl font-bold">
        Weather<span class="text-teal-400">UI</span>
      </NuxtLink >

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
