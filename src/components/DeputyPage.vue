<template>
  <div class="deputy-page md:mt-20 md:mb-12 mt-12 mb-10">
    <div v-if="deputy" class="deputy-info">
      <div class="flex lg:flex-row flex-col lg:items-start items-center">
        <img :src="deputy.imageUrl" :alt="deputy.name"
             class="object-cover object-top md:h-[60vh] sm:h-[35vh] h-[45vh] lg:w-[507px] sm:w-2/3 w-full rounded-[25px]">
        <div class="flex flex-col lg:ml-11 ml-0 md:mt-12 mt-5 lg:mt-0  lg:w-[68%] w-full">
          <h1 class="deputy-name text-black font-medium text-3xl md:mb-4 mb-6">{{ deputy.name }}</h1>
          <div class="flex xl:flex-row flex-col w-full items-start ">
            <div class="flex w-full xl:w-fit">
              <p class="grad flex w-full deputy-region lg:text-2xl text-xl text-[#1D2B50] border-2 border-solid border-transparent border-[#1D2B50]  rounded-[20px] xl:mr-2 xl:mb-0 mb-4 py-3  md:px-10 px-5">
                {{ deputy.region }} район</p>
            </div>
            <div class="flex w-full xl:w-fit">
              <p class="grad flex w-full break-words deputy-party lg:text-2xl text-xl text-[#1D2B50] border-2 border-solid border-transparent border-[#5691E9] rounded-[20px] xl:ml-2 xl:mb-0 mb-4 py-3 md:px-10 px-5">
                {{ deputy.factionTitle }}</p>
            </div>
          </div>
          <h2 class="lg:text-3xl md:text-2xl text-2xl font-bold mt-4 mb-1.5">Біографія</h2>
          <div class="whitespace-pre-line text-black text-xl">{{ deputy.biography }}</div>
        </div>
      </div>
      <div class="flex md:flex-row flex-col w-full md:my-28 mt-12 mb-10 justify-between">
        <div
            class="flex border-2 border-[#5691E9]  rounded-[20px]  md:w-3/6 md:mr-10 md:mb-0 mb-4 grad border-solid border-transparent ">
          <div class="schedule flex flex-col xl:px-40 px-5 w-full">
            <h2 class="lg:text-3xl md:text-2xl text-xl font-bold mt-9 mb-6">Графік прийому:</h2>
            <p class="font-normal text-xl">{{ deputy.schedule }}</p>
            <p class="text-xl">{{ deputy.address }}</p>
            <SignSchedule :deputy="deputy"/>
          </div>
        </div>
        <div class="flex flex-col border-2 border-solid border-transparent  rounded-[20px] md:ml-10  md:w-3/6 grad">
          <div class="deputy-contacts flex-col xl:px-40 px-5 flex w-full">
            <h2 class="lg:text-3xl md:text-2xl text-xl font-bold mt-9 mb-6">Контакти:</h2>
            <p class="text-xl">{{ deputy.phone }}</p>
            <p class="text-xl">email: {{ deputy.email }}</p>
            <div class="flex gap-2.5 my-6">
              <a v-if="deputy.facebook" :href="deputy.facebook" target="_blank">
                <img src="@/assets/social_icon/fb.svg" alt="Facebook" class="size-14"/>
              </a>
              <a v-if="deputy.instagram" :href="deputy.instagram" target="_blank">
                <img src="@/assets/social_icon/inst.svg" alt="Instagram" class="size-14"/>
              </a>
              <a v-if="deputy.telegram" :href="deputy.telegram" target="_blank">
                <img src="@/assets/social_icon/tg.svg" alt="Telegram" class="size-14"/>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-xl text-gray-500">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import {getFirestore, doc, getDoc} from 'firebase/firestore';
import SignSchedule from "@/components/SignSchedule.vue";
import router from "@/router/index.js";

export default {
  name: 'DeputyPage',
  components: {SignSchedule},
  data() {
    return {
      deputy: null,
      errorMessage: 'Завантаження інформації про депутата...'
    }
  },
  async created() {
    try {
      const db = getFirestore();
      const deputyId = this.$route.params.id;
      const deputyDoc = doc(db, 'deputies', deputyId);
      const deputySnapshot = await getDoc(deputyDoc);

      if (deputySnapshot.exists()) {
        const deputyData = deputySnapshot.data();
        const factionRef = doc(db, 'factions', deputyData.faction);
        const factionSnapshot = await getDoc(factionRef);

        this.deputy = {
          id: deputySnapshot.id,
          ...deputyData,
          factionTitle: factionSnapshot.exists() ? factionSnapshot.data().title : 'Не вказано',
        };
      } else {
        await router.push({name: 'DeputyNotFound'});
      }
    } catch (error) {
      console.error('Error fetching deputy:', error);
      this.errorMessage = 'Помилка при завантаженні даних';
    }
  }
}
</script>

<style scoped>

</style>
