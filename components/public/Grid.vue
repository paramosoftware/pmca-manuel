<template>
    <div class="sm:flex items-center sm:justify-between sm:items-center">
        <div class="flex flex-col w-full">
            <UIPageTitle>
                <PublicBreadcrumb :add-concept-link="userSelection" />
                {{ title }}
            </UIPageTitle>
            <div class="flex justify-end mb-4 mt-4 sm:mt-0 sm:mb-0">
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
        <div id="slotContainer" class="flex justify-center self-center">
            <slot />
        </div>
    </div>

    <div class="mt-6 max-w-full h-auto">
        <div class="flex flex-row md:flex-row mt-5 max-w-full h-auto">
            <div
                class="max-w-full w-full flex flex-col justify-start items-center space-y-8 mb-4"
            >
                <FieldInput
                    id="filter"
                    class="w-full self-start md:w-3/5 xl:w-2/5 text-3xl"
                    v-model="search"
                    type="text"
                    :placeholder="placeholder"
                    :disabled="filterDisabled"
                    size="lg"
                />
                <div
                    id="alphabetContainer"
                    v-if="navigationStore.isAlphabetical && props.hasAlphabetical"
                    class="max-w-full flex flex-col space-y-4 md:space-y-0 md:flex-row lg:flex-row space-x-4 items-center justify-center h-auto"
                >
                    <div
                        id="alphabetWrapper"
                        class="flex w-auto items-center flex-col justify-center h-full self-start md:flex-row max-w-full"
                    >
                        <ul
                            id="alphabeticalSelection"
                            class="max-w-full flex flex-row flex-1 flex-grow items-center overflow-x-auto overflow-y-hidden h-auto py-4"
                        >
                            <li>
                                <UButton
                                    :style="{
                                        borderTopRightRadius: '0',
                                        borderBottomRightRadius: '0'
                                    }"
                                    class="self-center border md:border-gray-300 sm:border-gray-400 text-sm px-2 py-2 font-normal hover:text-white bg-gray-50 text-pmca-primary"
                                    :class="[
                                        {
                                            'bg-pmca-green-500 text-white font-bold':
                                                navigationStore.isTodosActive,
                                            'text-sm py-3 px-2':
                                                navigationStore.isSmallScreen
                                        }
                                    ]"
                                    @click="navigationStore.handleTodos()"
                                    title="Mostrar todos os conceitos sem distinção alfabética."
                                    >TODOS</UButton
                                >
                            </li>
                            <li
                                v-for="(letter, index) in alphabetArr"
                                @click="
                                    navigationStore.setActiveLetter(letter);
                                    if (navigationStore.isTodosActive)
                                        navigationStore.toggleTodos();
                                "
                                class="cursor-pointer"
                                :class="{
                                    'bg-pmca-green-500 border-0 text-3xl text-white px-2 py-1':
                                        navigationStore.activeLetter == letter,
                                    'border border-gray-200 px-3 py-1 hover:bg-pmca-green-500 hover:text-white':
                                        navigationStore.activeLetter != letter,
                                    'py-3 px-6 text-sm':
                                        navigationStore.isSmallScreen &&
                                        navigationStore.activeLetter != letter,
                                    'py-3 px-6 text-xl':
                                        navigationStore.activeLetter ==
                                            letter &&
                                        navigationStore.isSmallScreen,
                                    'rounded-tr rounded-br':
                                        index == alphabetArr.length - 1
                                }"
                            >
                                {{ letter }}
                            </li>
                        </ul>
                    </div>
                </div>
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
            <div class="text-md" v-else-if="total === 0 && search !== ''">
                Nenhum item encontrado
                <span v-if="search !== ''"
                    >para "<i>{{ search.substring(0, 20) }}</i
                    >"</span
                >
            </div>
            <div class="flex-row items-center justify-between mt-5 md:mt-0">
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
                    v-else-if="!navigationStore.isAlphabetical"
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
                <div
                    v-for="concept in concepts"
                    :key="concept.id"
                    class="flex md:justify-center items-center"
                >
                    <PublicCard
                        :concept="concept"
                        class="flex-grow max-w-md md:max-w-md lg:max-w-xl mx-auto truncate"
                    />
                </div>
            </div>
        </div>

        <div
            class="text-xl text-center"
            v-if="search === '' && total === 0 && !pending"
        >
            Nenhum termo
            {{ props.userSelection ? 'selecionado' : 'encontrado' }}.
        </div>

        <div class="flex flex-row items-center justify-end mt-5 space-x-4">
            <UPagination
                v-if="total > pageSize"
                v-model="page"
                :total="total"
                :page-count="pageSize"
                show-last
                show-first
                :max="navigationStore.isSmallScreen ? 3 : 7"
                :size="navigationStore.isSmallScreen ? 'xs' : 'md'"
            />
            <FieldGridSelect
                v-if="total > 1"
                :options="[
                    { name: '16', value: 0 },
                    { name: '24', value: 1 },
                    { name: '32', value: 2 }
                ]"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
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
    },
    hasAlphabetical: {
        type: Boolean,
        default: true,
    }
});
const alphabetArr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// TODO: transform the internal search into a filter of the large search [PMCA-406]
// TODO: filter tree view based on search [DISCUSS]
// TODO: add transition/animations to page change [PMCA-405]

const [grid] = useAutoAnimate({ duration: 250 });

const router = useRouter();

const query = computed(() => {
    return router.currentRoute.value.query;
});

const mode = ref(query.value?.modo || 'alfa');

if (!props.hasTree) {
    mode.value = 'alfa';
}

// Move to utils...?
const isKeyOnLocalStorage = (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage)
        return window.localStorage.getItem(key) !== null;

    return false;
};

const isKeyValueOnLocalStorageAndIsTrue = (key: string) => {
    if (isKeyOnLocalStorage(key)) {
        return Boolean(localStorage.getItem(key));
    }
    return false;
};
//

const navigationStore = useNavigationStore();
const activeLetter = computed(() => {
    return navigationStore.activeLetter;
});

const conceptStore = useConceptStore();
await conceptStore.load('', props.userSelection);
await conceptStore.fetchConceptsTree();

const { concepts, page, pageSize, total, search, pending, sort } =
    storeToRefs(conceptStore);

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

onBeforeMount(() => {
    navigationStore.loadUserPreferences(
        isKeyOnLocalStorage('isPinned')
            ? Boolean(localStorage.getItem('isPinned'))
            : false,
        localStorage.getItem('lastSelectedNavigation') || null
    );
});
onUnmounted(() => {
    search.value = '';
});
</script>
