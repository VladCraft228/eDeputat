<template>
  <div class="flex justify-center w-full flex-col">
    <div class="relative w-full h-full">
      <input
          type="text"
          v-model="searchQuery"
          @input="handleInput"
          @keyup.enter="handleSearch"
          placeholder="Введіть ім'я депутата"
          class="input grad"
      />
      <button @click="emitSearch" class="absolute right-5 top-[45%] transform -translate-y-1/2 h-100">
        <img src="@/assets/icons/search.svg" alt="search" class="md:h-[31.69px] h-6"/>
      </button>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue';

export default {
  name: 'SearchBar',
  emits: ['search'],
  setup(props, {emit}) {
    const searchQuery = ref('');

    const emitSearch = () => {
      emit('search', searchQuery.value);
    };

    const handleInput = () => {
      if (searchQuery.value === '') {
        emit('search', '');
      }
    };
    const handleSearch = () => {
      emit('search', searchQuery.value);
    };

    return {
      searchQuery,
      emitSearch,
      handleInput,
      handleSearch,
    };
  }
};
</script>
