<script setup lang="ts">
import HeaderSection from "~/components/sections/HeaderSection.vue";

import type { GeocodeCityResponse } from "~/types/weather";
const selectedCity = useState<GeocodeCityResponse>("selectedCity");
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-12">
    <HeaderSection />
  </div>
</template>

<style></style>
