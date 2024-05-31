<template>
    <div class="flex">
        <aside
            id="tree-navigation"
            :class="
                closeClass +
                ' shadow-lg border border-gray-200 rounded-md hover:w-4/12 transition-all duration-300 max-h-screen'
            "
            v-if="!isSmallScreen"
            ref="treeNavigationRef"
        >
            <div class="flex p-4 h-full">
                <div class="flex flex-col w-full h-full">
                    <div class="flex justify-between items-center">
                        <div
                            class="flex items-center"
                            v-show="
                                isTreeNavigationOpen || isTreeNavigationPinned
                            "
                        >
                            <UIIcon
                                name="ph:push-pin"
                                :class="{
                                    'text-pmca-accent': isTreeNavigationPinned
                                }"
                                class="mr-3 hover:text-pmca-accent w-6 h-6"
                                title="Fixar"
                                @click="pinTreeNavigation"
                            />
                            <div class="text-lg font-semibold">
                                Classificação
                            </div>
                        </div>
                        <UIIcon
                            name="ph:tree-structure"
                            class="ml-auto"
                            cursor-class=""
                        />
                    </div>
                    <div
                        class="mt-4 overflow-auto h-full"
                        v-show="isTreeNavigationOpen || isTreeNavigationPinned"
                    >
                        <UITreeView
                            :tree="conceptsTree"
                            v-if="conceptsTree.length > 0"
                        />
                    </div>
                </div>
            </div>
        </aside>

        <aside v-else>
            <USlideover v-model="isTreeNavigationOpen" :overlay="false">
                <div class="flex p-4">
                    <div class="flex flex-col items-end w-full">
                        <UIIcon
                            name="ph:x"
                            class="ml-auto"
                            title="Fechar navegação"
                            @click="
                                isTreeNavigationOpen = !isTreeNavigationOpen
                            "
                        />

                        <UITreeView
                            :tree="conceptsTree"
                            class="mt-6"
                            v-if="conceptsTree.length > 0"
                        />
                    </div>
                </div>
            </USlideover>
        </aside>

        <main
            class="w-full shadow-lg border border-gray-200 rounded-md bg-white md:ml-5 p-4"
        >
            <div class="sm:flex sm:justify-between sm:items-center">
                <UIPageTitle>
                    {{ title }}
                </UIPageTitle>
                <div class="flex justify-end mb-4 mt-4 sm:mt-0 sm:mb-0">
                    <span
                        v-if="hasTree && isSmallScreen"
                        class="flex items-center"
                    >
                        <UIIcon
                            name="ph:tree-structure"
                            @click="
                                isTreeNavigationOpen = !isTreeNavigationOpen
                            "
                            title="Abrir classificação"
                        />
                    </span>

                    <span v-if="userSelection" class="flex items-center">
                        <UIIcon
                            name="ph:broom"
                            class="ml-3"
                            title="Desmarcar todos"
                            @click="conceptStore.clearSelection()"
                        />
                        <PublicExportDropdown class="ml-3" />
                    </span>
                </div>
            </div>

            <div
                v-if="mode === 'hier'"
                class="justify-start items-start border-t border-gray-200 mt-3"
            >
                <UITreeView
                    :tree="conceptsTree"
                    class="mt-6"
                    v-if="conceptsTree.length > 0"
                />
                <div class="text-xl mt-3" v-else-if="!pending">
                    Nenhuma categoria encontrada.
                </div>
            </div>

            <div class="mt-6" v-else>
                <div class="flex flex-col md:flex-row mt-5">
                    <div class="w-full md:w-1/3">
                        <FieldInput
                            id="filter"
                            v-model="search"
                            type="text"
                            :placeholder="placeholder"
                            :disabled="filterDisabled"
                            size="lg"
                        />
                    </div>
                </div>
                <div
                    class="mt-4 md:flex md:flex-row md:justify-between md:items-center"
                >
                    <div class="text-md" v-if="total > 0">
                        {{ total }}
                        {{ total > 1 ? 'itens' : 'item' }} encontrado{{
                            total > 1 ? 's' : ''
                        }}
                    </div>
                    <div
                        class="text-md"
                        v-else-if="total === 0 && search !== ''"
                    >
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
                            class="w-8 h-8 mr-3"
                            :name="
                                sort === 'asc'
                                    ? 'ph:sort-ascending'
                                    : 'ph:sort-descending'
                            "
                            title="Ordenar por nome"
                            @click="conceptStore.sortByName()"
                            v-if="total > 1"
                        />
                        <UPagination
                            v-model="page"
                            :total="total"
                            :page-count="pageSize"
                            show-last
                            show-first
                            v-if="total > pageSize"
                        />
                    </div>
                </div>

                <div class="flex flex-col mt-5 border-t border-gray-200 py-5">
                    <div
                        class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
                        ref="grid"
                    >
                        <div v-for="concept in concepts" :key="concept.id">
                            <PublicCard :concept="concept" />
                        </div>
                    </div>
                </div>

                <div
                    class="text-xl"
                    v-if="search === '' && total === 0 && !pending"
                >
                    Nenhum termo
                    {{ props.userSelection ? 'selecionado' : 'encontrado' }}.
                </div>

                <div
                    class="flex flex-row items-center justify-end mt-5"
                    v-if="total > pageSize"
                >
                    <UPagination
                        v-model="page"
                        :total="total"
                        :page-count="pageSize"
                        show-last
                        show-first
                        size="md"
                    />
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { tree } from 'd3';

const props = defineProps({
    title: {
        type: String,
        default: 'Termos'
    },
    userSelection: {
        type: Boolean,
        default: false
    },
    hasTree: {
        type: Boolean,
        default: true
    }
});

// TODO: transform the internal search into a filter of the large search
// TODO: filter tree view based on search
// TODO: add transition/animations to page change

const [grid] = useAutoAnimate({ duration: 250 });

const router = useRouter();

const query = computed(() => {
    return router.currentRoute.value.query;
});

const mode = ref(query.value?.modo || 'alfa');

if (!props.hasTree) {
    mode.value = 'alfa';
}

const conceptStore = useConceptStore();
await conceptStore.load('', props.userSelection);
await conceptStore.fetchConceptsTree();

const {
    concepts,
    page,
    pageSize,
    total,
    search,
    pending,
    sort,
    error,
    conceptsTree
} = storeToRefs(conceptStore);

search.value = query.value?.search?.toString() || '';

const filterDisabled = ref(
    search.value === '' && total.value === 0 && !pending.value
);

watch(total, () => {
    filterDisabled.value =
        search.value === '' && total.value === 0 && !pending.value;
});

watch(mode, () => {
    page.value = 1;
});

const userSelection = computed(() => {
    return props.userSelection;
});

watch(userSelection, async () => {
    await conceptStore.load('', true);
});

const placeholder = computed(() => {
    return props.userSelection ? 'Filtrar termos' : 'Pesquisar termos';
});

onUnmounted(() => {
    search.value = '';
});

const isSmallScreen = ref(false);
const isTreeNavigationPinned = ref(false);
const isTreeNavigationOpen = ref(false);
const treeNavigationRef = ref<HTMLElement | null>(null);
const closeClass = 'w-16';
const openClass = 'w-4/12';
const localStorageKey = 'isTreeNavigationFixed';

const openTreeNavigation = (open: boolean) => {
    if (isSmallScreen.value) {
        isTreeNavigationOpen.value = open;
        return;
    }

    if (!treeNavigationRef.value) {
        treeNavigationRef.value = document.getElementById('tree-navigation');
        if (!treeNavigationRef.value) {
            console.error('tree navigation not found');
            return;
        }
    }


    isTreeNavigationOpen.value = open;

    if (open || isTreeNavigationPinned.value) {
        console.log('removing close class');
        treeNavigationRef.value.classList.remove(closeClass);
        treeNavigationRef.value.classList.add(openClass);
        return;
    } else {
        treeNavigationRef.value.classList.remove(openClass);
        treeNavigationRef.value.classList.add(closeClass);
        return;
    }
};

const pinTreeNavigation = () => {
    const pinLocal = localStorage.getItem(localStorageKey);
    if (!pinLocal || pinLocal === 'false') {
        localStorage.setItem(localStorageKey, 'true');
        isTreeNavigationPinned.value = true;
    } else {
        localStorage.setItem(localStorageKey, 'false');
        isTreeNavigationPinned.value = false;
    }
};

onMounted(() => {
    isSmallScreen.value = window.innerWidth < 768;
    isTreeNavigationPinned.value = localStorage.getItem(localStorageKey) === 'true';
    openTreeNavigation(isTreeNavigationPinned.value);
    addHoverListener();

    window.addEventListener('resize', async () => {
        isSmallScreen.value = window.innerWidth < 768;
        if (!isSmallScreen.value) {
            await nextTick()
            isTreeNavigationOpen.value = isTreeNavigationOpen.value || isTreeNavigationPinned.value;
            openTreeNavigation(isTreeNavigationOpen.value);
            addHoverListener();
        }
    });
});

const addHoverListener = () => {
    if (treeNavigationRef.value) {
        treeNavigationRef.value.addEventListener('mouseenter', () => {
            openTreeNavigation(true);
        });

        treeNavigationRef.value.addEventListener('mouseleave', () => {
            openTreeNavigation(isTreeNavigationPinned.value);
        });
    }
};
</script>
