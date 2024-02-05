import ROUTES from '~/config/routes';

export default defineNuxtRouteMiddleware(async (to, from) => {
    
    const authenticated = await useAuth();

    if (to.path === '/login' && authenticated) {
        return navigateTo(ROUTES.restricted);
    }

    if (to.path !== '/login' && !authenticated) {
        return navigateTo('/login');
    }
});