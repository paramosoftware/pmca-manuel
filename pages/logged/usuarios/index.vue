<template>
    <ExternalNavbar />
    <div class="flex flex-col justify-center items-center mt-10">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral">
            <div class="flex flex-row justify-start items-center">
                <a href="/logged" class="text-red-900 uppercase text-lg hover:underline">
                    <Icon name="ph:arrow-left" class="w-5 h-5 text-black" />
                    VOLTAR
                </a>
            </div>

            <div class="justify-between flex flex-row items-center my-4">
                <h1 class="text-3xl text-black">Usuários</h1>
                <button @click="createUser"
                    class="text-white bg-red-900 p-2 focus:outline-none focus:border-transparent hover:bg-red-950">
                    NOVO
                </button>
            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="filter">
                    Filtrar
                </label>
                <input v-model="filter" 
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="filter" type="text" placeholder="Filtrar usuários">
            </div>

            <!-- TODO: Improve filters -->
            <!-- TODO: Pagination  -->

            <div v-for="user in filteredUsers" :key="user.id" class="w-full py-4 border-b border-red-900 last:border-b-0">
                <div class="w-full h-full flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl text-black">{{ user.name }}</h1>
                    </div>

                    <div>
                        <span class="sr-only">Editar usuário</span>
                        <Icon name="ph:pencil-simple" class="text-black w-6 h-6 m-1" title="Editar usuário"
                            @click="() => editUser(user.id)" />

                        <span class="sr-only">Excluir usuário</span>
                        <Icon name="ph:trash-simple" class="text-black w-6 h-6 m-1" title="Excluir usuário"
                            @click="() => deleteUser(user.id)" />
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const users = ref<User[]>([]);

const { data } = await useFetchWithBaseUrl('/api/users');

users.value = data.value;

const router = useRouter();

const createUser = () => {
    router.push('/logged/usuarios/criar');
}

const editUser = (id: number) => {
    router.push(`/logged/usuarios/editar/${id}`);
}

const deleteUser = async (id: number) => {
    const { data } = await useFetchWithBaseUrl(`/api/users/${id}`, {
        method: 'DELETE'
    });

    if (data) {
        users.value = users.value.filter(user => user.id !== id);
    }
}

const filter = ref('');

const filteredUsers = computed(() => {
    if (!filter.value) {
        return users.value;
    }

    return users.value.filter(user => user.name.toLowerCase().includes(filter.value.toLowerCase()));
});


</script>


<style scoped></style>