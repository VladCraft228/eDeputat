<template>
  <div>
    <h2 class="lg:text-4xl md:text-3xl text-2xl font-bold text-center md:my-12 mt-12 mb-10">Знайти депутата за
      ім'ям</h2>
    <SearchBar @search="handleSearch"/>
    <h2 class="lg:text-4xl md:text-3xl text-2xl font-bold text-center md:my-12 mt-12 mb-10">або за фракцією</h2>
    <FactionFilter @filterFaction="handleFactionFilter"/>
    <DeputyCarousel :searchQuery="searchQuery" :selectedFaction="selectedFaction"/>
  </div>
</template>

<script>
import {ref} from 'vue';
import DeputyCarousel from "@/components/DeputyCarousel.vue";
import FactionFilter from "@/components/FactionFilter.vue";
import SearchBar from "@/components/SearchBar.vue";

export default {
  components: {
    SearchBar,
    DeputyCarousel,
    FactionFilter,
  },
  setup() {
    const searchQuery = ref('');
    const selectedFaction = ref(null);

    const handleSearch = (query) => {
      searchQuery.value = query;
      // Clear selected faction if search query is empty
      if (query === '') {
        selectedFaction.value = null;
      }
    };

    const handleFactionFilter = (faction) => {
      selectedFaction.value = faction;
    };

    return {
      searchQuery,
      selectedFaction,
      handleSearch,
      handleFactionFilter
    };
  }
}
</script>
