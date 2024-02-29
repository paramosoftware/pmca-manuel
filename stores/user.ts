export const useUserStore = defineStore("user", () => {
  const id = ref("");
  const name = ref("");
  const isAdmin = ref(false);
  const permissions = ref<Permission>({});

  async function fetch() {
    const { data, pending, error } = (await useFetchWithBaseUrl(
      "/api/auth/user"
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
  }

  return {
    id,
    name,
    isAdmin,
    permissions,
    fetch,
  };
});
