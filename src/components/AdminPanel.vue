<template>

  <div class="flex w-full justify-center flex-col">
    <h2 class="h2">Admin Panel</h2>
    <div>
      <button @click="toggleSection('deputies')"
              class="bg-[#1D2B50] w-full p-5 rounded-[15px] text-white mb-3">
        Управління депутатами
      </button>
      <div v-if="activeSection === 'deputies'"
           class="md:flex-row w-full justify-space-between flex flex-col md:items-start gap-2 mb-10">

        <CreateDeputyForm/>
        <DeputyList/>
      </div>
    </div>
    <div>
      <button @click="toggleSection('factions')"
              class="bg-[#1D2B50] w-full p-5 rounded-[15px] text-white mb-3">
        Управління фракціями
      </button>
      <div v-if="activeSection === 'factions'"
           class="md:flex-row w-full justify-space-between flex flex-col md:items-start gap-2 mb-10">
        <CreateFaction/>
        <FactionList/>
      </div>
    </div>
    <div>
      <button @click="toggleSection('availability')"
              class="bg-[#1D2B50] w-full p-5 rounded-[15px] text-white mb-3">
        Управління розкладом
      </button>
      <div v-if="activeSection === 'availability'"
           class="md:flex-row w-full justify-space-between flex flex-col md:items-start gap-2 mb-10">
        <DeputyScheduleList/>
        <DeputyAvailabilityList/>
      </div>
    </div>
    <button @click="logout" class="filter_btn grad min-h-[40px] md:h-[70px] min-w-[70px] w-full text-xl !mt-10">
      Вийти
    </button>
  </div>

</template>

<script>
import {useToast} from "vue-toastification";
import {useAuthStore} from "@/stores/auth.js";
import {useMutation} from "vue-query";
import router from "@/router/index.js";
import CreateDeputyForm from '@/components/CreateDeputyForm.vue';
import DeputyList from "@/components/DeputyList.vue";
import CreateFaction from "@/components/CreateFaction.vue";
import FactionList from "@/components/FactionList.vue";
import DeputyScheduleList from "@/components/DeputyScheduleList.vue";
import DeputyAvailabilityList from "@/components/DeputyAvailabilityList.vue";

export default {
  data() {
    return {
      activeSection: null // Відстежуємо активну секцію
    };
  },
  setup() {
    const toast = useToast();
    const authStore = useAuthStore();
    const mutation = useMutation(
        async () => {
          try {
            await authStore.logout(); // Виконуємо логаут
            toast.warning('Ви вийшли з адмін-панелі');
            await router.push({name: 'AdminLogin'}); // Переходимо на сторінку логіну
          } catch (error) {
            console.error('Error during logout:', error);
          }
        },
    );
    const logout = () => {
      mutation.mutate();
    };
    return {
      logout,
      isLoading: mutation.isLoading,
    }
  },
  methods: {
    toggleSection(section) {
      this.activeSection = this.activeSection === section ? null : section;
    }
  },
  components: {
    DeputyAvailabilityList,
    CreateFaction,
    DeputyList,
    CreateDeputyForm,
    FactionList,
    DeputyScheduleList
  }
};
</script>
