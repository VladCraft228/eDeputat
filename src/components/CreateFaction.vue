<template>
  <div>
    <button @click="showForm = true" class="bg-green-500 text-white p-3 rounded-[15px] w-full">Створити фракцію</button>
    <transition>
      <div v-if="showForm" class="modal">
        <div class="modal-content !h-fit">
          <span @click="showForm = false" class="close">&times;</span>
          <h2>Створити фракцію</h2>
          <form class="flex flex-col md:my-2 mt-2 w-full justify-center items-normal"
                @submit.prevent="createFaction">
            <input class="input_modal grad" v-model="faction.title" type="text" placeholder="Назва фракції" required/>
            <button type="submit" class="bg-blue-500 w-full p-3 rounded-[15px] text-white mt-2" :disabled="isLoading">
              Створити
            </button>
            <button type="reset" class="bg-gray-400 w-full p-3 rounded-[15px] text-white mt-2" :disabled="isLoading">
              Почистити
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import {ref} from 'vue';
import {useToast} from 'vue-toastification';
import {getFirestore, collection, addDoc} from 'firebase/firestore';

export default {
  setup() {
    const toast = useToast();
    const showForm = ref(false);
    const isLoading = ref(false);
    const faction = ref({
      title: ''
    });

    const createFaction = async () => {
      isLoading.value = true;
      try {
        const db = getFirestore();
        const docRef = await addDoc(collection(db, 'factions'), faction.value);
        toast.success('Фракцію створено успішно');
        showForm.value = false;
        faction.value.title = '';
      } catch (error) {
        toast.error('Помилка при створенні фракції');
        console.error('Error creating faction:', error);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      showForm,
      faction,
      createFaction,
      isLoading
    };
  }
};
</script>
