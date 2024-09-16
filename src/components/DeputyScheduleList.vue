<template>
  <div>
    <button @click="openForm" class="bg-blue-500 text-white p-3 rounded-[15px] w-full">Управління розкладом депутата
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
    <!-- Вікно управління розкладом -->
    <transition>
      <div v-if="showScheduleForm" class="modal">
        <div class="modal-content">
          <span @click="closeForm" class="close">&times;</span>
          <h2>Управління розкладом депутата</h2>
          <!-- Показ обраного депутата -->
          <div class="mt-2 mb-4 p-3 bg-gray-100 rounded-[15px]">
            Вибраний депутат: {{ selectedDeputy.name }}
            <button @click="changeDeputy" class="bg-blue-500 text-white p-3 rounded-[15px] ml-0 sm:ml-2">
              Змінити депутата
            </button>
          </div>
          <!-- Кнопка "Очистити" -->
          <button @click="clearSchedule" class="bg-yellow-500 text-white p-3 rounded-[15px] mb-4">
            Очистити записи
          </button>
          <!-- Список записів на прийом -->
          <div class="h-[74%] overflow-auto">
            <h3>Записи на прийом</h3>
            <div v-for="appointment in appointments" :key="appointment.id" class="mb-4 p-4 border rounded-[15px]">
              <p><strong>Дата:</strong> {{ formatDate(appointment.date) }}</p>
              <p><strong>Час:</strong> {{ appointment.time }}</p>
              <p><strong>Ім'я:</strong> {{ appointment.name }} {{ appointment.surname }}</p>
              <p><strong>Телефон:</strong> {{ appointment.phone }}</p>
              <p><strong>Email:</strong> {{ appointment.email }}</p>
              <p><strong>Статус:</strong> {{ appointment.status }}</p>
              <div class="grid my-2 gap-2 sm:flex">
                <button @click="markCompleted(appointment)" class="bg-green-500 text-white p-3 rounded-[15px]">
                  Позначити як завершений
                </button>
                <button @click="cancelAppointment(appointment)" class="bg-red-500 text-white p-3 rounded-[15px]">
                  Скасувати
                </button>
                <button @click="unmarkStatus(appointment)" class="bg-yellow-500 text-white p-3 rounded-[15px]">
                  Відмінити статус
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
import {ref, onMounted} from 'vue';
import {useToast} from 'vue-toastification';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';

export default {
  setup() {
    const selectedDeputy = ref(null);
    const deputies = ref([]);
    const appointments = ref([]);
    const showDeputiesList = ref(false);
    const showScheduleForm = ref(false);
    const toast = useToast();

    onMounted(loadDeputies);

    async function loadDeputies() {
      try {
        const db = getFirestore();
        const deputiesSnapshot = await getDocs(collection(db, 'deputies'));
        deputies.value = deputiesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      } catch (error) {
        console.error('Error loading deputies:', error);
        toast.error('Не вдалося завантажити список депутатів');
      }
    }

    async function loadSchedule() {
      if (!selectedDeputy.value) return;

      try {
        const db = getFirestore();
        const schedulesQuery = query(
            collection(db, 'schedules'),
            where('deputyId', '==', selectedDeputy.value.id)
        );
        const schedulesSnapshot = await getDocs(schedulesQuery);
        appointments.value = schedulesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      } catch (error) {
        console.error('Error loading schedule:', error);
        toast.error('Не вдалося завантажити розклад');
      }
    }

    async function markCompleted(appointment) {
      try {
        const db = getFirestore();
        const appointmentRef = doc(db, 'schedules', appointment.id);
        await updateDoc(appointmentRef, {status: 'Завершено'});
        toast.success('Прийом завершено');
        await loadSchedule();
      } catch (error) {
        console.error('Error marking appointment as completed:', error);
        toast.error('Не вдалося позначити прийом як завершений');
      }
    }

    async function cancelAppointment(appointment) {
      try {
        const db = getFirestore();
        const appointmentRef = doc(db, 'schedules', appointment.id);
        await updateDoc(appointmentRef, {status: 'Скасовано'});
        toast.success('Прийом скасовано');
        await loadSchedule();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        toast.error('Не вдалося скасувати прийом');
      }
    }

    async function unmarkStatus(appointment) {
      try {
        const db = getFirestore();
        const appointmentRef = doc(db, 'schedules', appointment.id);
        await updateDoc(appointmentRef, {status: null}); // або інший статус, який вам підходить
        toast.success('Статус прийому відмінено');
        await loadSchedule();
      } catch (error) {
        console.error('Error unmarking status:', error);
        toast.error('Не вдалося відмінити статус прийому');
      }
    }

    async function clearSchedule() {
      if (!selectedDeputy.value) return;

      try {
        const db = getFirestore();
        const batch = writeBatch(db);

        const schedulesQuery = query(
            collection(db, 'schedules'),
            where('deputyId', '==', selectedDeputy.value.id),
            where('status', '!=', null)
        );
        const schedulesSnapshot = await getDocs(schedulesQuery);

        // Якщо немає записів для видалення, припиняємо виконання функції
        if (schedulesSnapshot.empty) {
          toast.info('Немає записів для очищення');
          return;
        }

        schedulesSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        toast.success('Записи очищено');
        await loadSchedule();
      } catch (error) {
        console.error('Error clearing schedule:', error);
        toast.error('Не вдалося очистити записи');
      }
    }


    function formatDate(dateString) {
      const options = {year: 'numeric', month: 'long', day: 'numeric'};
      return new Date(dateString).toLocaleDateString('uk-UA', options);
    }

    const openForm = async () => {
      await loadDeputies();
      showDeputiesList.value = true;
    };

    const closeForm = () => {
      showDeputiesList.value = false;
      showScheduleForm.value = false;
      selectedDeputy.value = null;
      appointments.value = [];
    };

    const selectDeputy = (deputy) => {
      selectedDeputy.value = deputy;
      showDeputiesList.value = false;
      showScheduleForm.value = true;
      loadSchedule();
    };

    const changeDeputy = () => {
      showScheduleForm.value = false;
      showDeputiesList.value = true;
    };

    return {
      selectedDeputy,
      deputies,
      appointments,
      showDeputiesList,
      showScheduleForm,
      openForm,
      closeForm,
      selectDeputy,
      changeDeputy,
      markCompleted,
      cancelAppointment,
      unmarkStatus,
      clearSchedule,
      formatDate
    };
  }
};
</script>