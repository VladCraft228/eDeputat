<template>
  <div>
    <div class="flex w-full items-center justify-start">
      <button @click="showForm = true"
              class="w-full bg-[#1D2B50] my-6 py-4 text-white rounded-[15px] text-xl font-normal">
        Записатися на прийом
      </button>
    </div>
    <transition>
      <div v-if="showForm" class="modal">
        <div class="modal-content !h-fit">
          <span @click="showForm = false" class="close">&times;</span>
          <h2 class="h2">Запис на прийом</h2>
          <form class="flex flex-col md:my-2 mt-2 mb-2 w-full justify-center items-normal"
                @submit.prevent="scheduleAppointment">
            <div class="flex md:flex-row flex-col md:mb-2">
              <select class="input_modal md:mr-10 grad" v-model="selectedDate" @change="loadAvailableTimes" required>
                <option disabled value="">Оберіть дату</option>
                <option v-for="date in availableDates" :key="date" :value="date">{{ formatDate(date) }}</option>
              </select>
              <select class="input_modal md:ml-10 grad" v-model="selectedTime" :disabled="!selectedDate" required>
                <option disabled value="">Оберіть вільний час</option>
                <option v-for="time in availableTimes" :key="time" :value="time">{{ time }}</option>
              </select>
            </div>
            <div class="flex md:flex-row flex-col md:mb-2">
              <input class="input_modal md:mr-8 grad" v-model="surname" type="text" placeholder="Прізвище" required/>
              <input class="input_modal grad" v-model="name" type="text" placeholder="Ім'я" required/>
              <input class="input_modal md:ml-8 grad" v-model="middlename" type="text" placeholder="По батькові"
                     required/>
            </div>
            <div class="flex md:flex-row flex-col md:mb-2">
              <input class="input_modal md:mr-10 grad" v-model="email" type="email" placeholder="Email"
                     @input="validateEmail" required/>
              <input class="input_modal md:ml-10 grad" v-model="phone" type="tel" placeholder="Номер телефону" required
                     @input="validatePhoneNumber"/>
            </div>
            <div
                class="flex flex-col w-full md:h-[90px] bg-[#D2E3FE] rounded-[20px] justify-center items-center my-2 text-[#404040]">
              <h3 class="md:text-2xl text-xl sm:py-4 py-1 font-bold text-wrap px-2 text-center">Врахуйте, будь ласка, що
                у випадку запізнення Ваш візит буде скасовано або перенесено!</h3>
            </div>
            <div class="flex w-full items-center justify-center">
              <button type="submit"
                      class="lg:w-[30%] md:w-[40%] w-full bg-[#1D2B50] mt-6 py-4 text-white rounded-[15px] text-xl">
                Записатись
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useToast} from 'vue-toastification';
import {getFirestore, collection, addDoc, query, where, getDocs} from 'firebase/firestore';

const props = defineProps({
  deputy: Object
});

const showForm = ref(false);
const selectedDate = ref('');
const selectedTime = ref('');
const surname = ref('');
const name = ref('');
const middlename = ref('');
const email = ref('');
const phone = ref('+380');

const availableDates = ref([]);
const availableTimes = ref([]);

const toast = useToast();

onMounted(loadAvailableDates);

async function loadAvailableDates() {
  try {
    const db = getFirestore();
    const q = query(collection(db, 'deputyAvailability'), where('deputyId', '==', props.deputy.id));
    const querySnapshot = await getDocs(q);
    const dates = querySnapshot.docs.map(doc => doc.data().date);
    availableDates.value = [...new Set(dates)].sort();
  } catch (error) {
    console.error('Error loading available dates:', error);
    toast.error('Не вдалося завантажити доступні дати');
  }
}

async function checkTimeAvailability(date, time) {
  const db = getFirestore();
  const schedulesRef = collection(db, 'schedules');
  const q = query(
      schedulesRef,
      where('deputyId', '==', props.deputy.id),
      where('date', '==', date),
      where('time', '==', time)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.empty; // Повертає true, якщо час доступний
}

async function loadAvailableTimes() {
  if (!selectedDate.value) return;

  try {
    const db = getFirestore();
    const availabilityQuery = query(
        collection(db, 'deputyAvailability'),
        where('deputyId', '==', props.deputy.id),
        where('date', '==', selectedDate.value)
    );
    const availabilitySnapshot = await getDocs(availabilityQuery);
    const availabilityTimes = availabilitySnapshot.docs.flatMap(doc => doc.data().times);

    // Отримуємо вже заброньовані часи
    const schedulesQuery = query(
        collection(db, 'schedules'),
        where('deputyId', '==', props.deputy.id),
        where('date', '==', selectedDate.value)
    );
    const schedulesSnapshot = await getDocs(schedulesQuery);
    const bookedTimes = schedulesSnapshot.docs.map(doc => doc.data().time);

    // Фільтруємо доступні часи, видаляючи вже заброньовані
    availableTimes.value = availabilityTimes.filter(time => !bookedTimes.includes(time)).sort();
  } catch (error) {
    console.error('Error loading available times:', error);
    toast.error('Не вдалося завантажити доступний час');
  }
}


function formatDate(dateString) {
  const options = {year: 'numeric', month: 'long', day: 'numeric'};
  return new Date(dateString).toLocaleDateString('uk-UA', options);
}

const validatePhoneNumber = (event) => {
  let input = event.target.value;
  if (!input.startsWith('+380')) {
    input = '+380' + input.replace(/\D/g, '');
  } else {
    input = '+380' + input.slice(4).replace(/\D/g, '');
  }
  phone.value = input.slice(0, 13); // Обмежуємо довжину до 13 символів
};

const validateEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
};

const clearForm = () => {
  selectedDate.value = '';
  selectedTime.value = '';
  surname.value = '';
  name.value = '';
  middlename.value = '';
  email.value = '';
  phone.value = '+380';
};

const scheduleAppointment = async () => {
  // Валідація формату введення телефону
  const phonePattern = /^\+380\d{9}$/;
  if (!phonePattern.test(phone.value)) {
    toast.error('Невірний формат номера телефону. Використовуйте формат +380XXYYYYYYY');
    return;
  }

  if (!validateEmail(email.value)) {
    toast.error('Невірний формат email. Будь ласка, введіть коректну адресу.');
    return;
  }

  try {
    // Перевіряємо доступність часу перед записом
    const isTimeAvailable = await checkTimeAvailability(selectedDate.value, selectedTime.value);
    if (!isTimeAvailable) {
      toast.error('Вибачте, цей час вже зайнятий. Будь ласка, виберіть інший час.');
      await loadAvailableTimes(); // Оновлюємо доступні часи
      return;
    }

    const db = getFirestore();
    const appointmentData = {
      deputyId: props.deputy.id,
      date: selectedDate.value,
      time: selectedTime.value,
      surname: surname.value,
      name: name.value,
      middlename: middlename.value,
      email: email.value,
      phone: phone.value,
      createdAt: new Date()
    };

    await addDoc(collection(db, 'schedules'), appointmentData);

    console.log('Appointment scheduled:', appointmentData);
    toast.success('Ви записалися на прийом!');
    clearForm();
    showForm.value = false;

    // Оновлюємо доступні часи після успішного запису
    await loadAvailableTimes();
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    toast.error('Не вдалося записатися на прийом. Спробуйте ще раз.');
  }
};
</script>

<style scoped>

</style>