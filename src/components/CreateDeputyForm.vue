<template>
  <div>
    <button @click="showForm = true" class="bg-green-500 text-white p-3 rounded-[15px] w-full">Створити депутата
    </button>
    <transition>
      <div v-if="showForm" class="modal">
        <div class="modal-content">
          <span @click="closeForm" class="close">&times;</span>
          <h2>Створити депутата</h2>
          <form class="flex flex-col md:my-2 mt-2 w-full justify-center items-normal"
                @submit.prevent="createDeputy">
            <input class="input_modal grad" v-model="deputy.name" type="text" placeholder="Ім'я" required/>
            <textarea class="input_modal grad resize-y !h-auto" rows="10" v-model="deputy.biography" type="text"
                      placeholder="Біографія" required/>
            <select class="input_modal grad" v-model="deputy.faction" required>
              <option value="" disabled>Виберіть фракцію</option>
              <option v-for="faction in factions" :key="faction.id" :value="faction.id">
                {{ faction.title }}
              </option>
            </select>
            <input class="input_modal grad" v-model="deputy.phone" type="tel" placeholder="Телефон" required
                   @input="validatePhoneNumber"/>
            <input class="input_modal grad" v-model="deputy.email" type="email" placeholder="Email" required
                   @input="validateEmail"/>
            <input class="input_modal grad" v-model="deputy.instagram" type="text" placeholder="Instagram"
                   @input="validateInstagram"/>
            <input class="input_modal grad" v-model="deputy.facebook" type="text" placeholder="Facebook"
                   @input="validateFacebook" required/>
            <input class="input_modal grad" v-model="deputy.telegram" type="text" placeholder="Telegram"
                   @input="validateTelegram"/>
            <input class="input_modal grad" v-model="deputy.address" type="text" placeholder="Адреса" required/>
            <input class="input_modal grad" v-model="deputy.region" type="text" placeholder="Район" required/>
            <input class="input_modal grad" v-model="deputy.schedule" type="text" placeholder="Графік" required/>
            <input class="input_modal grad" type="file" @change="handleFileUpload" accept="image/*" required/>
            <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="mt-2 w-1/2 h-1/2"/>
            <button type="submit" class="bg-blue-500 w-full p-3 rounded-[15px] text-white mt-2" :disabled="isLoading">
              {{ isLoading ? 'Створення...' : 'Створити' }}
            </button>
            <button type="button" class="bg-gray-400 w-full p-3 rounded-[15px] text-white mt-2" @click="resetForm"
                    :disabled="isLoading">Очистити
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {onMounted, ref} from 'vue';
import {useToast} from 'vue-toastification';
import {getFirestore, collection, addDoc, getDocs} from 'firebase/firestore';
import {getStorage, ref as storageRef, uploadBytes, getDownloadURL} from 'firebase/storage';
import {getAuth} from 'firebase/auth';

export default {
  setup() {
    const toast = useToast();
    const factions = ref([]);
    const showForm = ref(false);
    const isLoading = ref(false);
    const deputy = ref({
      name: '',
      biography: '',
      faction: '',
      phone: '+380',
      email: '',
      instagram: '',
      facebook: '',
      telegram: '',
      address: '',
      schedule: ''
    });

    const validatePhoneNumber = (event) => {
      let input = event.target.value;
      if (!input.startsWith('+380')) {
        input = '+380' + input.replace(/\D/g, '');
      } else {
        input = '+380' + input.slice(4).replace(/\D/g, '');
      }
      deputy.value.phone = input.slice(0, 13); // Обмежуємо довжину до 13 символів
    };

    const validateEmail = (email) => {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      return emailPattern.test(email);
    };

    const validateFacebook = (url) => {
      const facebookPattern = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9(\.\?)?]/;
      return facebookPattern.test(url);
    };

    const validateTelegram = (url) => {
      const telegramPattern = /^(https?:\/\/)?(t(elegram)?\.me|telegram\.org)\/[a-zA-Z0-9_]+/;
      return telegramPattern.test(url);
    };

    const validateInstagram = (url) => {
      const instagramPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9(\.\?)?]/;
      return instagramPattern.test(url);
    };


    const loadFactions = async () => {
      try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, 'factions'));
        factions.value = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      } catch (error) {
        toast.error('Не вдалося завантажити фракції');
        console.error('Error loading factions:', error);
      }
    };

    onMounted(loadFactions);

    const file = ref(null);
    const imagePreview = ref(null);

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

    const resetForm = () => {
      Object.keys(deputy.value).forEach(key => deputy.value[key] = '');
      file.value = null;
      imagePreview.value = null;
      deputy.value.phone = '+380';
    };

    const closeForm = () => {
      showForm.value = false;
      resetForm();
    };

    const createDeputy = async () => {
      if (!validateForm()) return;

      const phonePattern = /^\+380\d{9}$/;
      if (!phonePattern.test(deputy.value.phone)) {
        toast.error('Невірний формат номера телефону. Використовуйте формат +380XXYYYYYYY');
        return;
      }
      // Валідація email
      if (!validateEmail(deputy.value.email)) {
        toast.error('Невірний формат email. Будь ласка, введіть коректну адресу.');
        return;
      }

      // Валідація посилання на Facebook
      if (deputy.value.facebook && !validateFacebook(deputy.value.facebook)) {
        toast.error('Невірний формат посилання на Facebook. Введіть коректну URL-адресу.');
        return;
      }

      // Валідація посилання на Telegram
      if (deputy.value.telegram && !validateTelegram(deputy.value.telegram)) {
        toast.error('Невірний формат посилання на Telegram. Введіть коректну URL-адресу.');
        return;
      }

      // Валідація посилання на Instagram
      if (deputy.value.instagram && !validateInstagram(deputy.value.instagram)) {
        toast.error('Невірний формат посилання на Instagram. Введіть коректну URL-адресу.');
        return;
      }

      isLoading.value = true;
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          toast.error('Ви не авторизовані');
          return;
        }

        const storage = getStorage();
        const db = getFirestore();

        const imageRef = storageRef(storage, `deputies/${file.value.name}`);
        await uploadBytes(imageRef, file.value);
        const imageUrl = await getDownloadURL(imageRef);

        const deputyData = {
          ...deputy.value,
          imageUrl,
          createdAt: new Date(),
          createdBy: user.uid
        };

        await addDoc(collection(db, 'deputies'), deputyData);

        toast.success('Депутата створено успішно');
      } catch (error) {
        console.error('Error creating deputy:', error);
        toast.error('Помилка при створенні депутата');
      } finally {
        isLoading.value = false;
      }
    };

    const validateForm = () => {
      if (!file.value) {
        toast.error('Будь ласка, виберіть файл');
        return false;
      }
      return true;
    };

    return {
      showForm,
      deputy,
      factions,
      createDeputy,
      handleFileUpload,
      isLoading,
      imagePreview,
      resetForm,
      closeForm,
      validatePhoneNumber,
      validateEmail,
      validateTelegram,
      validateFacebook,
      validateInstagram
    };
  }
};
</script>