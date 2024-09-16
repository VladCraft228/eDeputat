<template>
  <div>
    <button @click="openForm" class="bg-blue-500 text-white p-3 rounded-[15px] w-full">Управління часами прийому
    </button>
    <!-- Вікно вибору депутата -->
    <transition>
      <div v-if="showDeputiesList" class="modal">
        <div class="modal-content !h-fit">
          <span @click="closeForm" class="close">&times;</span>
          <h2>Вибрати депутата</h2>
          <div v-for="deputy in deputies" :key="deputy.id" class="flex justify-between items-center my-3">
            {{ deputy.name }}
            <button @click="selectDeputy(deputy)" class="bg-green-500 text-white p-3 rounded-[15px]">
              Вибрати
            </button>
          </div>
        </div>
      </div>
    </transition>
    <!-- Вікно управління доступним часом -->
    <transition>
      <div v-if="showManageForm" class="modal">
        <div class="modal-content">
          <span @click="closeForm" class="close">&times;</span>
          <h2>Управління часами прийому</h2>
          <!-- Показ обраного депутата -->
          <div class="mt-2 mb-4 p-3 bg-gray-100 rounded-[15px]">
            Вибраний депутат: {{ selectedDeputy.name }}
            <button @click="changeDeputy" class="bg-blue-500 text-white p-3 rounded-[15px] ml-0 sm:ml-2">
              Змінити депутата
            </button>
          </div>
          <!-- Форма додавання нового часу -->
          <form @submit.prevent="addNewAvailability" class="mb-4">
            <h3>Додати новий час прийому</h3>
            <input v-model="newAvailability.date" type="date" class="border rounded-[15px] p-2 w-full mt-2 mb-2"
                   required/>
            <div class="flex flex-wrap mb-2">
              <div v-for="(time, index) in newAvailability.times" :key="index" class="mr-2 mb-2">
                <input
                    v-model="newAvailability.times[index]"
                    type="time"
                    class="border rounded-[15px] p-2"
                    required
                />
                <button type="button" @click="removeNewTime(index)" class="ml-1 text-red-500">&times;</button>
              </div>
              <button type="button" @click="addNewTime" class="bg-green-500 text-white px-3 mb-2 rounded-[15px]">+
              </button>
            </div>
            <button type="submit" class="bg-blue-500 text-white p-3 rounded-[15px]">Додати</button>
          </form>
          <!-- Список існуючого доступного часу -->
          <div class="h-[59%] overflow-auto">
            <h3>Існуючий час прийому</h3>
            <div v-for="(availability, index) in availabilities" :key="index" class="mb-4 p-4 border rounded-[15px]">
              <label for="date-input" class="block font-semibold mb-2">Дата:</label>
              <input
                  v-model="availability.date"
                  type="date"
                  class="border rounded-[15px] p-2 w-full"
                  id="date-input"
              />
              <div class="flex flex-wrap mt-2">
                <div v-for="(time, timeIndex) in availability.times" :key="timeIndex" class="mr-2 mb-2">
                  <input
                      v-model="availability.times[timeIndex]"
                      type="time"
                      class="border rounded-[15px] p-2"
                  />
                  <button @click="removeTime(index, timeIndex)" class="ml-1 text-red-500">&times;</button>
                </div>
                <button @click="addTime(index)" class="bg-green-500 mb-2 text-white px-3 rounded-[15px]">+</button>
              </div>
              <div class="grid my-2 gap-2 sm:flex">
                <button @click="updateAvailability(index)" class="bg-blue-500 text-white p-3 rounded-[15px]">Оновити
                </button>
                <button @click="deleteAvailability(index)" class="bg-red-500 text-white p-3 rounded-[15px]">Видалити
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {ref} from 'vue';
import {getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, query, where, addDoc} from 'firebase/firestore';
import {useToast} from 'vue-toastification';
import {getAuth} from 'firebase/auth';

export default {
  setup() {
    const availabilities = ref([]);
    const deputies = ref([]);
    const selectedDeputy = ref(null);
    const showDeputiesList = ref(false);
    const showManageForm = ref(false);
    const toast = useToast();
    const newAvailability = ref({
      date: '',
      times: ['']
    });

    const fetchDeputies = async () => {
      try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, 'deputies'));
        deputies.value = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      } catch (error) {
        console.error('Error loading deputies:', error);
        toast.error('Помилка при завантаженні списку депутатів');
      }
    };

    const selectDeputy = (deputy) => {
      selectedDeputy.value = deputy;
      showDeputiesList.value = false;
      showManageForm.value = true;
      loadAvailabilitiesForDeputy();
    };

    const loadAvailabilitiesForDeputy = async () => {
      if (!selectedDeputy.value) return;

      try {
        const db = getFirestore();
        const q = query(collection(db, 'deputyAvailability'), where('deputyId', '==', selectedDeputy.value.id));
        const querySnapshot = await getDocs(q);
        availabilities.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error loading availabilities:', error);
        toast.error('Помилка при завантаженні доступного часу');
      }
    };

    const addTime = (index) => {
      availabilities.value[index].times.push('');
    };

    const removeTime = (index, timeIndex) => {
      availabilities.value[index].times.splice(timeIndex, 1);
    };

    const updateAvailability = async (index) => {
      try {
        const db = getFirestore();
        const availability = availabilities.value[index];
        await updateDoc(doc(db, 'deputyAvailability', availability.id), {
          date: availability.date,
          times: availability.times
        });
        toast.success('Час прийому оновлено успішно');
      } catch (error) {
        console.error('Error updating availability:', error);
        toast.error('Помилка при оновленні часу прийому');
      }
    };

    const deleteAvailability = async (index) => {
      try {
        const db = getFirestore();
        const availability = availabilities.value[index];
        await deleteDoc(doc(db, 'deputyAvailability', availability.id));
        availabilities.value.splice(index, 1);
        toast.success('Запис видалено успішно');
      } catch (error) {
        console.error('Error deleting availability:', error);
        toast.error('Помилка при видаленні запису');
      }
    };

    const openForm = async () => {
      await fetchDeputies();
      showDeputiesList.value = true;
    };

    const closeForm = () => {
      showDeputiesList.value = false;
      showManageForm.value = false;
      selectedDeputy.value = null;
      availabilities.value = [];
      resetNewAvailabilityForm();
    };

    const changeDeputy = () => {
      showManageForm.value = false;
      showDeputiesList.value = true;
    };

    const addNewTime = () => {
      newAvailability.value.times.push('');
    };

    const removeNewTime = (index) => {
      newAvailability.value.times.splice(index, 1);
    };

    const resetNewAvailabilityForm = () => {
      newAvailability.value = {
        date: '',
        times: ['']
      };
    };

    const addNewAvailability = async () => {
      if (!validateNewAvailability()) return;

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          toast.error('Ви не авторизовані');
          return;
        }

        const db = getFirestore();

        const availabilityData = {
          deputyId: selectedDeputy.value.id,
          date: newAvailability.value.date,
          times: newAvailability.value.times,
          createdAt: new Date(),
          createdBy: user.uid
        };

        await addDoc(collection(db, 'deputyAvailability'), availabilityData);

        toast.success('Доступний час прийому додано успішно');
        resetNewAvailabilityForm();
        loadAvailabilitiesForDeputy();
      } catch (error) {
        console.error('Error adding availability:', error);
        toast.error('Помилка при додаванні доступного часу прийому');
      }
    };

    const validateNewAvailability = () => {
      if (newAvailability.value.times.some(time => !time)) {
        toast.error('Будь ласка, заповніть всі поля часу або видаліть порожні');
        return false;
      }
      return true;
    };

    return {
      availabilities,
      deputies,
      selectedDeputy,
      showDeputiesList,
      showManageForm,
      newAvailability,
      selectDeputy,
      addTime,
      removeTime,
      updateAvailability,
      deleteAvailability,
      openForm,
      closeForm,
      changeDeputy,
      addNewTime,
      removeNewTime,
      addNewAvailability,
    };
  }
};
</script>