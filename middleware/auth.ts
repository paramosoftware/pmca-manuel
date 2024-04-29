import ROUTES from '~/config/routes';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const userStore = useUserStore();
    const isAuthenticated = await userStore.isAuthenticated();

    if (to.path === '/login' && isAuthenticated) {
        return navigateTo(ROUTES.restricted);
    }

    if (to.path !== '/login' && !isAuthenticated) {

        await userStore.logout();
        return navigateTo('/login');
    }
});
