<template>
  <div>
    <button @click="fetchDeputies" class="bg-blue-500 text-white p-3 rounded-[15px] w-full">
      Список депутатів
    </button>
    <transition>
      <div v-show="showList" class="modal">
        <div class="modal-content !h-fit">
          <span @click="showList = false" class="close">&times;</span>
          <h2>Список депутатів</h2>
          <div v-for="deputy in deputies" :key="deputy.id" class="flex flex-col my-3">
            <div class="flex flex-col  sm:flex-row justify-between">
              {{ deputy.name }}
              <div class="grid gap-2 my-2 sm:my-0 sm:flex ">
                <button class="bg-yellow-400 sm:w-fit w-full p-3 rounded-[15px]" @click="editDeputy(deputy)">
                  Редагувати
                </button>
                <button class="bg-red-400 sm:w-fit w-full p-3 rounded-[15px]" @click="deleteDeputy(deputy.id)">
                  Видалити
                </button>
              </div>
            </div>
            <div v-if="isEditing && currentDeputy.id === deputy.id">
              <form @submit.prevent="updateDeputy(deputy.id)">
                <input class="input_modal grad" v-model="currentDeputy.name" type="text" placeholder="Ім'я" required/>
                <textarea class="input_modal grad resize-y !h-auto" rows="10" v-model="currentDeputy.biography"
                          type="text" placeholder="Біографія" required/>
                <select class="input_modal grad" v-model="currentDeputy.faction" required>
                  <option value="" disabled>Виберіть фракцію</option>
                  <option v-for="faction in factions" :key="faction.id" :value="faction.id">
                    {{ faction.title }}
                  </option>
                </select>
                <input class="input_modal grad" v-model="currentDeputy.phone" type="text" placeholder="Телефон"
                       maxlength="13" required/>
                <input class="input_modal grad" v-model="currentDeputy.email" type="email" placeholder="Email"
                       required/>
                <input class="input_modal grad" v-model="currentDeputy.instagram" type="text" placeholder="Instagram"/>
                <input class="input_modal grad" v-model="currentDeputy.facebook" type="text" placeholder="Facebook"/>
                <input class="input_modal grad" v-model="currentDeputy.telegram" type="text" placeholder="Telegram"/>
                <input class="input_modal grad" v-model="currentDeputy.address" type="text" placeholder="Адреса"
                       required/>
                <input class="input_modal grad" v-model="currentDeputy.region" type="text" placeholder="Район"
                       required/>
                <input class="input_modal grad" v-model="currentDeputy.schedule" type="text" placeholder="Графік"
                       required/>

                <!-- Photo Update -->
                <input class="input_modal grad" type="file" @change="handleFileUpload" accept="image/*"/>
                <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="mt-2 w-1/2 h-1/2"/>

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
import {getStorage, ref as storageRef, uploadBytes, getDownloadURL} from 'firebase/storage';

export default {
  setup() {
    const toast = useToast();
    const showList = ref(false);
    const deputies = ref([]);
    const isEditing = ref(false);
    const currentDeputy = ref({});
    const imagePreview = ref(null);
    const file = ref(null);
    const factions = ref([]);

    const loadFactions = async () => {
      try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, 'factions'));
        factions.value = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      } catch (error) {
        console.error('Error loading factions:', error);
        toast.error('Помилка при завантаженні фракцій');
      }
    };

    onMounted(loadFactions);

    const fetchDeputies = async () => {
      showList.value = true;
      try {
        const db = getFirestore();
        const deputyCollection = collection(db, 'deputies');
        const deputySnapshot = await getDocs(deputyCollection);
        deputies.value = deputySnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
      } catch (error) {
        console.error('Error fetching deputies:', error);
        toast.error('Помилка при завантаженні списку депутатів');
      }
    };

    const editDeputy = (deputy) => {
      currentDeputy.value = {...deputy};
      isEditing.value = true;
    };

    const cancelEdit = () => {
      isEditing.value = false;
      currentDeputy.value = {};
      file.value = null;
      imagePreview.value = null;
    };

    const handleFileUpload = (event) => {
      file.value = event.target.files[0];
      if (file.value) {
        const reader = new FileReader();
        reader.onload = e => {
          imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file.value);
      }
    };

    const updateDeputy = async (id) => {
      try {
        const db = getFirestore();
        const deputyRef = doc(db, 'deputies', id);
        const updatedData = {...currentDeputy.value};

        if (file.value) {
          const storage = getStorage();
          const imageRef = storageRef(storage, `deputies/${file.value.name}`);
          await uploadBytes(imageRef, file.value);
          const imageUrl = await getDownloadURL(imageRef);
          updatedData.imageUrl = imageUrl;
        }

        await updateDoc(deputyRef, updatedData);
        toast.success('Дані депутата оновлено');
        isEditing.value = false;
        fetchDeputies();
      } catch (error) {
        console.error('Error updating deputy:', error);
        toast.error('Помилка при оновленні даних депутата');
      }
    };

    const deleteDeputy = async (id) => {
      try {
        const db = getFirestore();
        const deputyRef = doc(db, 'deputies', id);
        await deleteDoc(deputyRef);
        toast.success('Депутата видалено');
        fetchDeputies();
      } catch (error) {
        console.error('Error deleting deputy:', error);
        toast.error('Помилка при видаленні депутата');
      }
    };

    return {
      showList,
      deputies,
      isEditing,
      currentDeputy,
      imagePreview,
      factions,
      fetchDeputies,
      editDeputy,
      updateDeputy,
      deleteDeputy,
      cancelEdit,
      handleFileUpload,
    };
  },
};
</script>
