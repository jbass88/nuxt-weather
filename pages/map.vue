<script setup lang="ts">
import { ref } from "vue";
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import HeaderSection from "~/components/sections/HeaderSection.vue";
import type { RadioGroupItem, RadioGroupValue } from "@nuxt/ui";

const config = useRuntimeConfig();
const apiKey = config.public.openWeatherApiKey;
const error = ref("");
const center = [35, -90]; // whatever coordinates

const overlays = ref<RadioGroupItem[]>([
  { label: "Clouds", value: "clouds_new" },
  { label: "Precipitation", value: "precipitation_new" },
  { label: "Temperature", value: "temp_new" },
  { label: "Wind", value: "wind_new" },
  { label: "Pressure", value: "pressure_new" },
]);
const selectedOverlay = ref<RadioGroupValue>("clouds_new");
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
    <div class="mt-4">
      <URadioGroup v-model="selectedOverlay" :items="overlays" variant="table"  />
    </div>
    <UCard class="my-6">
      <ClientOnly>
        <LMap
          style="height: 400px; width: 100%"
          :zoom="6"
          :center="center"
          :use-global-leaflet="false"
        >
          <!-- Base layer -->
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <!-- OWM Clouds overlay -->
          <LTileLayer
            :url="`https://tile.openweathermap.org/map/${selectedOverlay}/{z}/{x}/{y}.png?appid=${apiKey}`"
            attribution="&copy; OpenWeatherMap"
          />
          <!-- Add more overlays as needed -->
        </LMap>
      </ClientOnly>
    </UCard>
  </div>
</template>

<style></style>
