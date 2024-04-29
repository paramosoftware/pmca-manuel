export const useUserStore = defineStore('user', () => {
    const id = ref('');
    const name = ref('');
    const isAdmin = ref(false);
    const permissions = ref<Permission>({});
    const resources = ref<Resource[]>([]);
    const canImport = computed(() => permissions.value['Entry']?.import);
    const accessToken = ref('');
    const csrfToken = ref('');

    async function fetch() {
        await isAuthenticated();

        const { data, pending, error } = (await useFetchWithBaseUrl(
            '/api/auth/user'
        )) as {
            data: Ref<User & { permissions: Permission }>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        if (data.value) {
            id.value = data.value.id;
            name.value = data.value.name;
            isAdmin.value = data.value.isAdmin ?? false;
            permissions.value = data.value.permissions;
        }

        pending.value = pending.value;
        error.value = error.value;

        await fetchResources();
    }

    async function fetchResources() {
        const { data, pending, error } = (await useFetchWithBaseUrl(
            '/api/resource',
            {
                method: 'GET',
                params: {
                    where: {
                        name: Object.keys(permissions.value).filter(
                            (key) => permissions.value[key]?.update
                        )
                    }
                }
            }
        )) as {
            data: Ref<PaginatedResponse>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        resources.value = (data.value.items as Resource[]) ?? [];
        pending.value = pending.value;
        resources.value.sort((a, b) =>
            a.labelPlural.localeCompare(b.labelPlural)
        );
    }

    async function isAuthenticated() {
        const { data } = (await useFetchWithBaseUrl('/api/auth/refresh')) as {
            data: Ref<{ accessToken?: string; csrf?: string }>;
        };

        if (data?.value) {
            accessToken.value = data.value.accessToken ?? '';
            csrfToken.value = data.value.csrf ?? '';

            const csrf = getCookieOptions('csrf');
            const access = getCookieOptions('access');

            useState(access.name, () => accessToken.value);
            useCookie(csrf.name, csrf.options).value = csrfToken.value;
            useCookie(access.name, access.options).value = accessToken.value;

            return true;
        } else {
            return false;
        }
    }

    async function logout() {
        await useFetchWithBaseUrl('/api/auth/logout', {
            method: 'POST'
        });

        const access = getCookieOptions('access', true);
        const csrf = getCookieOptions('csrf', true);
        useCookie(access.name, access.options).value = '';
        useCookie(csrf.name, csrf.options).value = '';
    }

    return {
        id,
        name,
        isAdmin,
        permissions,
        resources,
        canImport,
        fetch,
        isAuthenticated,
        logout
    };
});
