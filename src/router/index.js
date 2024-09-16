import {createRouter, createWebHistory} from 'vue-router'
import Home from '@/components/Home.vue'
import AdminLogin from "@/components/AdminLogin.vue";
import NotFound from "@/components/NotFound.vue";
import DeputyPage from "@/components/DeputyPage.vue";
import AdminPanel from "@/components/AdminPanel.vue";
import {useAuthStore} from '@/stores/auth';
import DeputyNotFound from "@/components/DeputyNotFound.vue";
import DeputyCarousel from "@/components/DeputyCarousel.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/carousel',
        name: 'DeputyCarousel',
        component: DeputyCarousel,
        meta: {requiresAuth: false}  // Доступний без аутентифікації
    },
    {
        path: '/admin-login',
        name: 'AdminLogin',
        component: AdminLogin
    },
    {
        path: '/admin-panel',
        name: 'AdminPanel',
        component: AdminPanel,
        meta: {requiresAuth: true},
    },
    {
        path: '/deputy/:id',
        name: 'DeputyPage',
        component: DeputyPage,
        props: true
    },
    {
        path: '/deputy-not-found',
        name: 'DeputyNotFound',
        component: DeputyNotFound
    },
    {
        path: '/:catchAll(.*)',
        name: 'NotFound',
        component: NotFound
    },


]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    if (!authStore.initialized) {
        await authStore.initializeAuth();
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (authStore.user && to.name === 'AdminLogin') {
        // Якщо користувач вже авторизований і намагається потрапити на сторінку входу
        next({name: 'AdminPanel'});
    } else if (requiresAuth && !authStore.user) {
        // Якщо маршрут вимагає авторизації, а користувач не авторизований
        next('/admin-login');
    } else {
        next();
    }
});

export default router
