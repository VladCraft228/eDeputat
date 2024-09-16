<template>
  <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:gap-x-[56px] lg:gap-y-[33px] md:gap-x-[40px] md:gap-y-[33px] gap-6">
    <button
        v-for="faction in factions"
        :key="faction.id"
        @click="selectFaction(faction.title)"
        class="filter_btn grad"
        :class="{ 'selected': selectedFaction === faction.title }"
    >
      {{ faction.title }}
    </button>
  </div>
</template>

<script>
import {ref, onMounted} from 'vue';
import {getFirestore, collection, getDocs} from 'firebase/firestore';

export default {
  name: 'FactionFilter',
  emits: ['filterFaction'],
  setup(props, {emit}) {
    const factions = ref([]);
    const selectedFaction = ref(null);

    const fetchFactions = async () => {
      try {
        const db = getFirestore();
        const factionsSnapshot = await getDocs(collection(db, 'factions'));

        const fetchedFactions = factionsSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
        }));

        factions.value = fetchedFactions;
      } catch (error) {
        console.error('Error fetching factions:', error);
      }
    };

    const selectFaction = (faction) => {
      if (selectedFaction.value === faction) {
        selectedFaction.value = null;
      } else {
        selectedFaction.value = faction;
      }
      emit('filterFaction', selectedFaction.value);
    };

    onMounted(fetchFactions);

    return {
      factions,
      selectedFaction,
      selectFaction,
    };
  },
};
</script>
