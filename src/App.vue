<template>
  <div class="min-h-screen container mx-auto md:px-0 px-3 font-custom">
    <Header/>
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition>
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
  <Footer/>
</template>

<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

export default {
  components: {
    Header,
    Footer
  }
}
</script>

<style>
@import '../src/assets/style.css';
@import '../src/assets/fonts/stylesheet.css';

</style>
