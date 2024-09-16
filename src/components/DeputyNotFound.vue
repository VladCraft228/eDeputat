<template>
  <div class="text-center text-xl text-gray-500 mt-[20%]">
    <p>Такого депутата не існує. Ви будете перенаправлені на головну сторінку через {{ countdown }} секунд...</p>
  </div>
</template>

<script>
export default {
  name: 'DeputyNotFound',
  data() {
    return {
      countdown: 5 // Час в секундах до переадресації
    }
  },
  created() {
    this.startCountdown();
  },
  methods: {
    startCountdown() {
      const interval = setInterval(() => {
        if (this.countdown > 1) {
          this.countdown--;
        } else {
          clearInterval(interval);
          this.$router.push('/');
        }
      }, 1000);
    }
  }
}
</script>
