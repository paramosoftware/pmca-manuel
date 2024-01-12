<template>
    <div class="flex flex-col justify-center items-center mt-5 mb-auto">
        <div class="container max-w-screen-lg mx-auto p-5 bg-white border border-neutral rounded-lg shadow-sm">
            <div class="flex flex-row justify-start items-center">
                <UIAnchorReturn :href=ROUTES.restricted />
            </div>

            <div class="justify-between flex flex-row items-center my-4">
                <h1 class="text-4xl first-letter:uppercase">{{ labelPlural }}</h1>
                <NuxtLink :to="createUrl">
                    <UButton>{{ genderNoun === 'f' ? 'Nova' : 'Novo' }}</UButton>
                </NuxtLink>
            </div>

            <div class="mt-4">
                <FieldInput id="filter" v-model="search" type="text" :placeholder="'Filtrar ' + uncapitalize(labelPlural)"
                    :disabled="filterDisabled" />
            </div>

            <div v-if="pending" class="mt-4">
                <Icon name="ph:spinner" class="animate-spin h-10 w-10 text-pmca-primary" />
                <p>Carregando {{ uncapitalize(labelPlural) }}...</p>
            </div>

            <div class="mt-4 flex justify-between">
                <div class="text-md" v-if="total > 0">
                    {{ total }} {{ total > 1 ? 'itens' : 'item' }} encontrado{{ total > 1 ? 's' : '' }}
                </div>
                <div class="text-md" v-else-if="total === 0 && search !== ''">
                    Nenhum item encontrado
                    <span v-if="search !== ''">para "<i>{{ search }}</i>"</span>
                </div>
                <div v-if="total > pageSize">
                    <UPagination v-model="page" :total="total" :page-count="pageSize" show-last show-first :max="6" />
                </div>
            </div>

            <div v-if="error" class="mt-4">
                <p>Erro ao carregar {{ uncapitalize(labelPlural) }}.</p>
            </div>

            <div v-if="items && items?.length > 0" class="mt-4">
                <div v-for="item in items" :key="item.id" class="w-full py-4 border-b border-pmca-accent last:border-b-0">
                    <div class="w-full h-full flex items-center justify-between">
                        <NuxtLink :to="editUrl + '/' + item.id">
                            <h1 v-if="item.label" v-html="item.label"></h1>
                            <h1 v-else-if="item.name" v-html="item.name"></h1>
                            <h1 v-else>Item sem rótulo ({{ item.id }})</h1>
                        </NuxtLink>
                        <div>
                            <NuxtLink :to="editUrl + '/' + item.id">
                                <Icon name="ph:pencil-simple" class="w-6 h-6 m-1 cursor-pointer" />
                            </NuxtLink>
                            <Icon name="ph:trash-simple" class="w-6 h-6 m-1 cursor-pointer" @click="openModal(item)" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-5 flex justify-end">
                <div v-if="total > pageSize">
                    <UPagination v-model="page" :total="total" :page-count="pageSize" show-last show-first :max="6" />
                </div>
            </div>

            <ModalDialog 
                v-model="isModalDialogOpen" 
                :title="modalTitle" :message="modalMessage"
                :confirmButtonText="modalButtonText" 
                @confirm="deleteItem()"
                @close="isModalDialogOpen = false"
            />

        </div>
    </div>
</template>

<script setup lang="ts">
import ROUTES from '~/config/routes';

definePageMeta({
    middleware: 'auth'
});

const path = useRoute().params.path as string;

const itemToDelete = ref<Item | null>(null);
const isModalDialogOpen = ref(false);
const modalTitle = 'Confirmar exclusão';
const modalMessage = 'Tem certeza que deseja excluir este item?';
const modalButtonText = 'Excluir';

const listStore = useListStore();
await listStore.fetch(path);

const { labelSlug, labelPlural, genderNoun, items, page, pageSize, total, search, pending, error } = storeToRefs(listStore);

const createUrl = ROUTES.create + labelSlug.value;
const editUrl = ROUTES.edit + labelSlug.value;

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
}

onUnmounted(() => {
    listStore.destroy();
    destroyStore(listStore);
});

useHead({
    title: 'Listar ' + uncapitalize(labelPlural.value) + ' | ' + useRuntimeConfig().public.appName,
});
</script>