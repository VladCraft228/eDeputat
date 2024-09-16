<template>
  <div>
    <button @click="fetchFactions" class="bg-blue-500 text-white p-3 rounded-[15px] w-full">
      Список фракцій
    </button>
    <transition>
      <div v-show="showList" class="modal">
        <div class="modal-content !h-fit">
          <span @click="showList = false" class="close">&times;</span>
          <h2>Список фракцій</h2>
          <div v-for="faction in factions" :key="faction.id" class="flex flex-col my-3 ">
            <div class="flex flex-col sm:flex-row justify-between">
              {{ faction.title }}
              <div class="grid my-2 sm:my-0 gap-2 sm:flex">
                <button class="bg-yellow-400 sm:w-fit w-full p-3 rounded-[15px]" @click="editFaction(faction)">
                  Редагувати
                </button>
                <button class="bg-red-400 sm:w-fit w-full p-3 rounded-[15px]" @click="deleteFaction(faction.id)">
                  Видалити
                </button>
              </div>
            </div>
            <div v-if="isEditing && currentFaction.id === faction.id">
              <form @submit.prevent="updateFaction(faction.id)">
                <input class="input_modal grad" v-model="currentFaction.title" type="text" placeholder="Назва фракції"
                       required/>
                <button type="submit" class="bg-blue-500 w-full p-3 rounded-[15px] text-white mt-2">
                  Оновити
                </button>
                <button type="button" @click="cancelEdit" class="bg-gray-400 w-full p-3 rounded-[15px] text-white mt-2">
                  Скасувати
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {ref, onMounted} from 'vue';
import {useToast} from 'vue-toastification';
import {getFirestore, collection, getDocs, doc, deleteDoc, updateDoc} from 'firebase/firestore';

export default {
  setup() {
    const toast = useToast();
    const showList = ref(false);
    const factions = ref([]);
    const isEditing = ref(false);
    const currentFaction = ref({});

    const fetchFactions = async () => {
      showList.value = true;
      try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, 'factions'));
        factions.value = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      } catch (error) {
        console.error('Error fetching factions:', error);
        toast.error('Помилка при завантаженні фракцій');
      }
    };

    const editFaction = (faction) => {
      currentFaction.value = {...faction};
      isEditing.value = true;
    };

    const cancelEdit = () => {
      isEditing.value = false;
      currentFaction.value = {};
    };

    const updateFaction = async (id) => {
      try {
        const db = getFirestore();
        const factionRef = doc(db, 'factions', id);
        await updateDoc(factionRef, {title: currentFaction.value.title});
        toast.success('Фракцію оновлено');
        isEditing.value = false;
        fetchFactions();
      } catch (error) {
        console.error('Error updating faction:', error);
        toast.error('Помилка при оновленні фракції');
      }
    };

    const deleteFaction = async (id) => {
      try {
        const db = getFirestore();
        const factionRef = doc(db, 'factions', id);
        await deleteDoc(factionRef);
        toast.success('Фракцію видалено');
        fetchFactions();
      } catch (error) {
        console.error('Error deleting faction:', error);
        toast.error('Помилка при видаленні фракції');
      }
    };

    return {
      showList,
      factions,
      isEditing,
      currentFaction,
      fetchFactions,
      editFaction,
      updateFaction,
      deleteFaction,
      cancelEdit,
    };
  },
};
</script>
