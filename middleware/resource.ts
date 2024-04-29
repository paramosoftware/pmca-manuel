import ROUTES from '~/config/routes';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const userStore = useUserStore();
    await userStore.fetch();

    let action = 'read';
    let resource = to.params?.path as string;
    // TODO: hardcoded
    if (to.path.includes('criar')) {
        action = 'create';
    } else if (to.path.includes('editar')) {
        action = 'update';
    } else if (to.path.includes('importar')) {
        action = 'import';
        resource = 'Concept';
    } else if (to.path.includes('listar')) {
        action = 'read';
    }

    const { resources, permissions } = storeToRefs(userStore);

    let hasPermission = false;

    for (const r of resources.value) {
        if (
            r.nameNormalized == resource ||
            r.model == resource ||
            r.labelSlug == resource
        ) {
            // @ts-ignore
            if (permissions.value[r.model]?.[action]) {
                hasPermission = true;
                break;
            }
        }
    }

    if (!hasPermission) {
        return navigateTo(ROUTES.restricted, { replace: true });
    }
});
