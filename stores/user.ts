export const useUserStore = defineStore('user', () => {
    const id = ref('');
    const name = ref('');
    const isAdmin = ref(false);
    const permissions = ref<Permission>({});
    const resources = ref<Resource[]>([]);
    const canImport = computed(() => permissions.value['Entry']?.import);

    async function fetch() {
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

    return {
        id,
        name,
        isAdmin,
        permissions,
        resources,
        canImport,
        fetch
    };
});
