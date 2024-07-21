<template>
    <UICardContainer>
        <template #header>
            <div class="flex flex-row justify-between items-center">
                <UIAnchorReturn :href="ROUTES.restricted" />
            </div>

            <div class="justify-between flex flex-row items-center my-4">
                <UIContainerTitle>{{ labelPlural }}</UIContainerTitle>
                <div class="flex flex-row items-center space-x-2">
                    <UIIcon
                        name="ph:plus-circle"
                        @click="goToCreateForm"
                        title="Criar"
                        v-if="canCreate"
                    />
                    <UIIcon
                        @click="openModalPosition"
                        v-if="listStore.isHierarchical"
                        name="ph:list-numbers"
                        title="Alterar posição dos itens"
                    />
                    <UIPositionModal
                        v-model="isPositionModalOpen"
                        :resource="listStore.model"
                        :isPositionModalOpen="isPositionModalOpen"
                        @isPositionModalOpen="isPositionModalOpen = $event"
                    />
                    <UDropdown
                        :items="moreOptions"
                        v-if="moreOptions[0].length > 0"
                    >
                        <UIIcon
                            name="ph:dots-three-outline-vertical"
                            title="Mais opções"
                        />
                    </UDropdown>
                </div>
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
                class="animate-spin h-10 w-10 text-app-primary"
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

        <ul v-if="items && items?.length > 0" class="mt-4" ref="list">
            <li
                v-for="item in items"
                :key="item.id"
                class="w-full border border-gray-200 bg-gray-100 p-1 pl-2 rounded-md shadow-md mt-4"
            >
                <span class="w-full h-full flex items-center justify-between">
                    <NuxtLink :to="editUrl + '/' + item.id" class="flex-grow">
                        <h1 v-if="item.label || item.name">
                            {{ item.label || item.name }}
                        </h1>
                        <h1 v-else>Item sem rótulo ({{ item.id }})</h1>
                    </NuxtLink>

                    <span class="flex items-center">
                        <NuxtLink
                            :to="editUrl + '/' + item.id"
                            v-if="canUpdate"
                        >
                            <UIButton size="sm" square class="mr-1">
                                <UIIcon
                                    name="ph:pencil-simple"
                                    title="Editar"
                                    variant="button"
                                />
                            </UIButton>
                        </NuxtLink>
                        <UIButton size="sm" square v-if="canDelete">
                            <UIIcon
                                name="ph:trash-simple"
                                title="Excluir"
                                variant="button"
                                @click="openModal(item)"
                            />
                        </UIButton>
                    </span>
                </span>
            </li>
        </ul>
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
            @confirm="modalFunction"
            @close="isModalDialogOpen = false"
        />
    </UICardContainer>
</template>

<script setup lang="ts">
import ROUTES from '~/config/routes';
import type { DropdownItem } from '#ui/types';
const isPositionModalOpen = ref(false);

const openModalPosition = () => {
    isPositionModalOpen.value = true;
};

definePageMeta({
    middleware: ['auth', 'resource']
});

const [list] = useAutoAnimate({ duration: 400 });

const path = useRoute().params.path as string;

const itemToDelete = ref<Item | null>(null);
const isModalDialogOpen = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');
const modalButtonText = ref('');
const modalFunction = ref(() => {});

const listStore = useListStore();
await listStore.fetch(path);

const {
    label,
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
    canUpdate,
    canBatch,
    isGlossary
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
    modalTitle.value = 'Confirmar exclusão';
    modalMessage.value = 'Tem certeza que deseja excluir este item?';
    if (isGlossary) {
        modalMessage.value += `<br><br><b>Todos os termos associados também serão excluídos.</b>`;
    }
    modalButtonText.value = 'Excluir';
    modalFunction.value = () => deleteItem();
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

const moreOptions = [[]] as DropdownItem[][];

if (canBatch.value) {
    moreOptions[0].push({
        label: 'Excluir tudo',
        icon: 'i-ph-eraser',
        click: () => {
            openModalForDeleteAll();
        }
    });
}

function openModalForDeleteAll() {
    modalTitle.value = 'Confirmar exclusão';
    modalMessage.value =
        'Tem certeza que deseja excluir todos os itens? Esta ação não poderá ser desfeita.';
    modalButtonText.value = 'Excluir todos';
    modalFunction.value = deleteAll;
    isModalDialogOpen.value = true;
}

async function deleteAll() {
    await listStore.deleteAll();
    isModalDialogOpen.value = false;
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
