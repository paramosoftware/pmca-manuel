export default defineNuxtRouteMiddleware(async (to, from) => {
    
    const { isAuthenticated }  = useAuth();

    const authenticated = await isAuthenticated();

    if (to.path === '/login' && authenticated) {
        return navigateTo('/logged');
    }

    if (to.path !== '/login' && !authenticated) {
        return navigateTo('/login');
    }
    
    if (to.path == '/logout') {
        return navigateTo('/logout');
    }
});