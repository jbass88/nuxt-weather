<script setup lang="ts">
import { ref, watch } from "vue";
import type { GeocodeApiResponse, GeocodeCityResponse } from "~/types/weather";
import countries from "i18n-iso-countries";

const searchTerm = ref("");
const groups = computed(() => [
  {
    id: "locations",
    items: formatResults.value || [],
  },
]);
const open = ref(false);

const isLoading = ref(false);
const location = ref<GeocodeCityResponse | null>(null);
const selectedCity = useState<GeocodeCityResponse | null>(
  "selectedCity",
  () => null
);
const userLocation = useState<{ lat: number; lon: number } | null>(
  "userLocation"
);

const formatResults = ref<
  {
    id: string;
    label: string;
    suffix: string;
    state: string;
    country: string;
    countryCode?: string;
    countryName?: string;
    lat?: number;
    lon?: number;
  }[]
>([]);

function onSelect(item: any) {
  if (item) {
    open.value = false;

    let newCity = {
      key: item.id,
      city: item.label,
      state: item.state,
      country: item.countryCode,
      lat: item.lat,
      lon: item.lon,
    };

    selectedCity.value = null;
    selectedCity.value = newCity;
  }
}

async function geocodeLocation(query: string) {
  isLoading.value = true;

  location.value = null;
  formatResults.value = [];

  if (!query) {
    isLoading.value = false;
    return;
  }

  try {
    const fetchRes = await $fetch<GeocodeApiResponse>("/api/weather/geocode", {
      method: "POST",
      body: {
        city: query,
      },
    });
    if (fetchRes && fetchRes.success) {
      const responseObjs = fetchRes.response;
      if (responseObjs.length >= 1) {
        for (var i = 0; i < responseObjs.length; i++) {
          const responseCity = responseObjs[i].name;
          const responseState = responseObjs[i].state ?? "";
          let responseCountry = responseObjs[i].country ?? "";
          let responseCountryCode = responseObjs[i].country ?? "";
          let responseCountryName =
            countries.getName(responseObjs[i].country, "en") ?? "";
          if (responseCountryCode) {
            responseCountry = responseCountryName;
          }
          const responseLat = responseObjs[i].lat ?? 0.0;
          const responseLon = responseObjs[i].lon ?? 0.0;
          const responseKey = i.toString();
          let formatSuffix = "";
          if (responseState) {
            formatSuffix += ", " + responseState;
          }
          if (responseCountry) {
            formatSuffix += ", " + responseCountry;
          }
          formatResults.value.push({
            id: responseKey,
            label: responseCity,
            suffix: formatSuffix,
            state: responseState,
            country: responseCountry,
            countryCode: responseCountryCode.toLowerCase(),
            countryName: responseCountryName,
            lat: responseLat,
            lon: responseLon,
          });
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
  isLoading.value = false;
}

async function reverseGeocode(lat: number, lon: number) {
  isLoading.value = true;

  location.value = null;
  searchTerm.value = ""
  formatResults.value = [];

  if (!lat || !lon) {
    isLoading.value = false;
    return;
  }

  try {
    const fetchRes = await $fetch<GeocodeApiResponse>("/api/weather/reverse", {
      method: "POST",
      body: {
        lat: lat,
        lon: lon,
      },
    });
    if (fetchRes && fetchRes.success) {
      const responseObjs = fetchRes.response;
      if (responseObjs.length >= 1) {
        open.value = true
        for (var i = 0; i < responseObjs.length; i++) {
          const responseCity = responseObjs[i].name;
          const responseState = responseObjs[i].state ?? "";
          let responseCountry = responseObjs[i].country ?? "";
          let responseCountryCode = responseObjs[i].country ?? "";
          let responseCountryName =
            countries.getName(responseObjs[i].country, "en") ?? "";
          if (responseCountryCode) {
            responseCountry = responseCountryName;
          }
          const responseLat = responseObjs[i].lat ?? 0.0;
          const responseLon = responseObjs[i].lon ?? 0.0;
          const responseKey = i.toString();
          let formatSuffix = "";
          if (responseState) {
            formatSuffix += ", " + responseState;
          }
          if (responseCountry) {
            formatSuffix += ", " + responseCountry;
          }
          formatResults.value.push({
            id: responseKey,
            label: responseCity,
            suffix: formatSuffix,
            state: responseState,
            country: responseCountry,
            countryCode: responseCountryCode.toLowerCase(),
            countryName: responseCountryName,
            lat: responseLat,
            lon: responseLon,
          });
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
  isLoading.value = false;
}

watch(searchTerm, (q) => {
  geocodeLocation(q);
});

watch(userLocation, async (newVal, oldVal) => {
  if (newVal) {
    reverseGeocode(newVal.lat, newVal.lon);
  }
});
</script>

<template>
  <div class="">
    <UCard
      v-if="selectedCity"
      variant="solid"
      class="bg-[var(--surface)] border border-[var(--border)] shadow-lg rounded-xl text-[var(--txt)]"
    >
      <template #header>
        <div class="flex justify-end">
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            size="xs"
            aria-label="Clear"
            @click="selectedCity = null"
          />
        </div>
      </template>

      <div class="flex items-center gap-3">
        <img
          v-if="selectedCity.country"
          :src="`https://flagcdn.com/24x18/${selectedCity.country.toLowerCase()}.png`"
          :alt="selectedCity.country"
          class="w-6 h-4 rounded shadow-sm"
        />
        <div>
          <span class="text-lg font-bold">{{ selectedCity.city }}</span>

          <span v-if="selectedCity.state" class="ml-2 text-sm text-gray-400"
            >{{ selectedCity.state }},
            {{ countries.getName(selectedCity.country, "en") ?? "" }}</span
          >
          <span v-if="!selectedCity.state" class="ml-2 text-sm text-gray-400">{{
            countries.getName(selectedCity.country, "en") ?? ""
          }}</span>
        </div>
      </div>

      <template #footer>
        <div class="text-sm text-gray-500">
          Coordinates: {{ selectedCity.lat }}, {{ selectedCity.lon }}
        </div>
      </template>
    </UCard>
    <div class="my-6"></div>
    <UModal
      title="City Selector"
      description="Please enter a location, zipcode, or coordinates"
      v-model:open="open"
    >
      <UButton
        icon="i-lucide-search"
        size="lg"
        class="w-full text-sm text-gray-500"
        variant="outline"
        label="New York, NY, US or 10001, US or 40.7527, -73.9967"
        @click="open = true"
      />
      <template #content>
        <UCommandPalette
          v-model:search-term="searchTerm"
          placeholder="New York, NY, US or 10001, US or 40.7527, -73.9967"
          :loading="isLoading"
          :groups="groups"
          @update:model-value="onSelect"
          class="h-80 bg-[var(--surface)] border border-[var(--border)] shadow-lg rounded-xl text-[var(--txt)]"
        >
          <template #item="{ item }">
            <div class="flex px-2">
              <img
                v-if="item.countryCode"
                :src="`https://flagcdn.com/24x18/${item.countryCode.toLowerCase()}.png`"
                :alt="item.countryName"
                class="w-6 h-4"
                loading="lazy"
              />
              <div class="px-2">{{ item.label }} {{ item.suffix }}</div>
            </div>
          </template>
        </UCommandPalette>
      </template>
    </UModal>
  </div>
</template>
