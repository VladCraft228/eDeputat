<template>
  <div class="flex w-full justify-center">
    <form class="flex flex-col md:my-12 mt-12 mb-10 sm:w-3/6 w-full  justify-center items-normal"
          @submit.prevent="login">
      <h1 class="lg:text-4xl md:text-3xl text-2xl font-bold text-center md:my-12 mt-12 mb-10">Адмін Панель</h1>
      <label class="lg:text-3xl md:text-2xl text-xl" for="username">Email:</label>
      <input class="input grad md:my-2 my-1" v-model="email" type="email"
             pattern="^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$"
             placeholder="Email" required/>
      <label class="lg:text-3xl md:text-2xl text-xl" for="password">Пароль:</label>
      <input class="input grad md:my-2 my-1" v-model="password" type="password" placeholder="Password" required/>
      <div class="flex w-full justify-end">
        <button class="filter_btn grad min-h-[40px] md:h-[70px] min-w-[70px] sm:w-[200px] w-full text-xl my-2"
                :disabled="isLoading" type="submit">{{ isLoading ? 'Вхід в систему...' : 'Увійти' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import {ref} from 'vue';
import {useMutation} from 'vue-query';
import {useAuthStore} from '@/stores/auth';
import {useToast} from 'vue-toastification';
import {useRouter} from 'vue-router';

export default {
  setup() {
    const authStore = useAuthStore();
    const toast = useToast();
    const router = useRouter();

    if (authStore.user) {
      router.push({name: 'AdminPanel'});
    }

    const email = ref('');
    const password = ref('');

    const mutation = useMutation(
        async () => {
          await authStore.login(email.value, password.value);
        },
        {
          onSuccess: () => {
            toast.success('Успішно увійшли в систему!');
            router.push({name: 'AdminPanel'});
          },
          onError: (error) => {
            console.error(`${error.message}`);
            toast.error(`Помилка при вході. Перевірте дані.`);
          }
        }
    );

    const login = () => {
      mutation.mutate();
    };

    return {
      email,
      password,
      login,
      isLoading: mutation.isLoading,
    };
  }
};
</script>