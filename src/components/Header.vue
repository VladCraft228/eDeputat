<template>
  <router-link to="/"
               class="bg-header relative rounded-b-[35px] text-white flex items-start justify-center p-4 min-h-[100px] md:h-[188px] h-auto bg-center bg-cover">
    <img src="@/assets/icons/logodnipro.svg" alt="logodnipro"
         class="lg:w-auto md:w-11 w-[1.78rem] lg:pr-8 md:pr-3 pr-2">
    <div class="text-center font-bold lg:text-7xl md:text-5xl text-3xl text-gray-100 z-10">Мій депутат</div>
  </router-link>
</template>

<script>
export default {
  name: 'Header',
}
</script>

<style scoped>

</style>
