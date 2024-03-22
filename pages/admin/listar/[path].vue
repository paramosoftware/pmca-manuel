<template>
    <UICardContainer>
        <template #header>
            <div class="flex flex-row justify-between items-center">
                <UIAnchorReturn :href="ROUTES.restricted" />
            </div>

            <div class="justify-between flex flex-row items-center my-4">
                <UIContainerTitle>{{ labelPlural }}</UIContainerTitle>
                <UIIcon
                    name="ph:plus-circle"
                    @click="goToCreateForm"
                    title="Criar novo"
                    class="w-8 h-8 cursor-pointer"
                    v-if="canCreate"
                />
            </div>
        </template>

        <div class="mt-4">
            <FieldInput
                id="filter"
                v-model="search"
                type="text"
                :placeholder="'Filtrar ' + uncapitalize(labelPlural)"
                :disabled="filterDisabled"
                size="sm"
            />
        </div>

        <div v-if="pending" class="mt-4">
            <UIIcon
                name="ph:spinner"
                class="animate-spin h-10 w-10 text-pmca-primary"
            />
            <p>Carregando {{ uncapitalize(labelPlural) }}...</p>
        </div>

        <div
            class="mt-4 md:flex md:flex-row md:justify-between md:items-center"
        >
            <div class="text-md" v-if="total > 0">
                {{ total }} {{ total > 1 ? 'itens' : 'item' }} encontrado{{
                    total > 1 ? 's' : ''
                }}
            </div>
            <div class="text-md" v-else-if="total === 0 && search !== ''">
                Nenhum item encontrado
                <span v-if="search !== ''"
                    >para "<i>{{ search.substring(0, 20) }}</i
                    >"</span
                >
            </div>
            <div
                class="flex flex-row items-center justify-between mt-5 md:mt-0"
            >
                <UIIcon
                    class="mr-3"
                    :name="
                        sort === 'asc'
                            ? 'ph:sort-ascending'
                            : 'ph:sort-descending'
                    "
                    title="Ordenar por nome"
                    @click="listStore.sortByName()"
                    v-if="total > 1"
                />

                <UPagination
                    v-model="page"
                    :total="total"
                    :page-count="pageSize"
                    show-last
                    show-first
                    :max="6"
                    size="sm"
                    v-if="total > pageSize"
                />
            </div>
        </div>

        <div v-if="error" class="mt-4">
            <p>Erro ao carregar {{ uncapitalize(labelPlural) }}.</p>
        </div>

        <div v-if="items && items?.length > 0" class="mt-4">
            <div
                v-for="item in items"
                :key="item.id"
                class="w-full border border-gray-200 bg-gray-100 p-1 pl-2 rounded-md shadow-md mt-4"
            >
                <div class="w-full h-full flex items-center justify-between">
                    <NuxtLink :to="editUrl + '/' + item.id" class="flex-grow">
                        <h1 v-if="item.label || item.name">
                            {{ item.label || item.name }}
                        </h1>
                        <h1 v-else>Item sem rótulo ({{ item.id }})</h1>
                    </NuxtLink>

                    <div class="flex items-center">
                        <NuxtLink
                            :to="editUrl + '/' + item.id"
                            v-if="canUpdate"
                        >
                            <UIButton size="sm" square class="mr-1">
                                <UIIcon
                                    name="ph:pencil-simple"
                                    class="w-5 h-5"
                                    title="Editar"
                                />
                            </UIButton>
                        </NuxtLink>
                        <UIButton size="sm" square v-if="canDelete">
                            <UIIcon
                                name="ph:trash-simple"
                                class="w-5 h-5"
                                title="Excluir"
                                @click="openModal(item)"
                            />
                        </UIButton>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="total === 0 && search === '' && !pending" class="mt-4">
            <p>Nenhum item cadastrado.</p>
        </div>

        <div class="mt-5 flex justify-end">
            <div v-if="total > pageSize">
                <UPagination
                    v-model="page"
                    :total="total"
                    :page-count="pageSize"
                    show-last
                    show-first
                    :max="6"
                    size="sm"
                />
            </div>
        </div>

        <ModalDialog
            v-model="isModalDialogOpen"
            :title="modalTitle"
            :message="modalMessage"
            :confirmButtonText="modalButtonText"
            @confirm="deleteItem()"
            @close="isModalDialogOpen = false"
        />
    </UICardContainer>
</template>

<script setup lang="ts">
import ROUTES from '~/config/routes';
definePageMeta({
    middleware: ['auth', 'resource']
});

const path = useRoute().params.path as string;

const itemToDelete = ref<Item | null>(null);
const isModalDialogOpen = ref(false);
const modalTitle = 'Confirmar exclusão';
const modalMessage = 'Tem certeza que deseja excluir este item?';
const modalButtonText = 'Excluir';

const listStore = useListStore();
await listStore.fetch(path);

const {
    labelSlug,
    labelPlural,
    genderNoun,
    items,
    page,
    pageSize,
    sort,
    total,
    search,
    pending,
    error,
    canCreate,
    canDelete,
    canUpdate
} = storeToRefs(listStore);

const createUrl = ROUTES.create + labelSlug.value;
const editUrl = computed(() =>
    canUpdate.value
        ? ROUTES.edit + labelSlug.value
        : ROUTES.list + labelSlug.value
);

const filterDisabled = computed(() => {
    return search.value === '' && total.value === 0 && !pending.value;
});

async function openModal(item: any) {
    itemToDelete.value = item;
    isModalDialogOpen.value = true;
}

const deleteItem = async () => {
    if (itemToDelete.value) {
        await listStore.deleteItem(itemToDelete.value.id);
    }
    isModalDialogOpen.value = false;
    itemToDelete.value = null;
};

function goToCreateForm() {
    navigateTo(createUrl);
}

onUnmounted(() => {
    listStore.destroy();
    destroyStore(listStore);
});

useHead({
    title:
        'Listar ' +
        uncapitalize(labelPlural.value) +
        ' | ' +
        useRuntimeConfig().public.appName
});
</script>
