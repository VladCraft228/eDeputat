<template>
  <footer
      class="relative font-custom  flex min-h-[100px] md:h-[110px] h-auto bg-center bg-cover bg-[#1D2B50] justify-center items-center">
    <img src="@/assets/icons/footerlogo.svg" alt="footerlogo"
         class="lg:w-auto md:w-11 w-[1.78rem] lg:pr-8 md:pr-3 pr-2">
    <div class="font-normal text-center text-white md:text-2xl text-xl z-10">Розроблено єДніпро</div>
    <router-link to="/admin-login" class="text-amber-50  absolute right-2 bottom-0 opacity-0 hover:opacity-100">Увійти в
      адмін панель
    </router-link>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
}
</script>
