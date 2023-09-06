import { ROUTES } from '~/config';

export default defineNuxtRouteMiddleware(async (to, from) => {
    
    const { isAuthenticated }  = useAuth();

    const authenticated = await isAuthenticated();

    if (to.path === '/login' && authenticated) {
        return navigateTo(ROUTES.restricted);
    }

    if (to.path !== '/login' && !authenticated) {
        return navigateTo('/login');
    }
});