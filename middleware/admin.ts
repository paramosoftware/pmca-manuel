import ROUTES from '~/config/routes';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const userStore = useUserStore();
    await userStore.fetch();

    if (!userStore.isAdmin) {
        return navigateTo(ROUTES.restricted, { replace: true });
    }
});
