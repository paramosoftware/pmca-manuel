:<template>
    <div
        class="flex flex-col h-full w-full sm:w-4/6 md:w-2/6 shadow-lg border border-gray-200 p-3 rounded-md bg-gray-100 mb-3"
        v-if="isSmallScreen"
    >
        <div
            class="text-lg font-semibold justify-between items-center flex cursor-pointer"
            @click="isTreeNavigationOpen = !isTreeNavigationOpen"
        >
            Abrir classificação
            <UIIcon name="ph:tree-structure" class="ml-auto" cursor-class="" />
        </div>
    </div>
    <div class="flex">
        <aside
            id="tree-navigation"
            :class="
                closeClass +
                ' hover:' +
                openClass +
                ' shrink-0 shadow-lg border border-gray-200 rounded-md transition-all duration-300 max-h-screen bg-gray-50 overflow-auto'
            "
            v-if="!isSmallScreen"
            ref="treeNavigationRef"
        >
            <div class="flex p-4 h-full">
                <div class="flex flex-col w-full h-full">
                    <div class="flex justify-between items-center mb-4">
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
                        class="overflow-auto h-full"
                        v-show="isTreeNavigationOpen || isTreeNavigationPinned"
                    >
                        <UITreeView
                            :tree="conceptsTree"
                            :concept-store="
                                useConceptStoreForTree
                                    ? conceptStore
                                    : undefined
                            "
                            v-if="conceptsTree.length > 0"
                        />
                    </div>
                </div>
            </div>
        </aside>

        <aside v-else>
            <USlideover
                v-model="isTreeNavigationOpen"
                class="text-pmca-primary"
                side="left"
                :ui="{
                    background: 'bg-gray-100' 
                }"
            >
                <div class="p-4 overflow-x-auto">
                    <div class="flex flex-row justify-between">
                        <div class="text-lg font-semibold">Classificação</div>

                        <UIIcon
                            name="ph:x"
                            class="ml-auto"
                            title="Fechar navegação"
                            @click="
                                isTreeNavigationOpen = !isTreeNavigationOpen
                            "
                        />
                    </div>

                    <UITreeView
                        :tree="conceptsTree"
                        class="mt-6"
                        v-if="conceptsTree.length > 0"
                    />
                </div>
            </USlideover>
        </aside>

        <main
            :class="mainDivClassClose +  ' w-full flex-1 shadow-lg border border-gray-200 rounded-md bg-white xl:ml-5 p-4 h-full'"
            ref="mainRef"
            id="main-navigation"
        >
            <slot></slot>
        </main>
    </div>
</template>

<script setup lang="ts">
defineProps({
    useConceptStoreForTree: {
        type: Boolean,
        default: true
    }
});

const conceptStore = useConceptStore();
await conceptStore.fetchConceptsTree();

const { conceptsTree } = storeToRefs(conceptStore);

const isSmallScreen = ref(false);
const isTreeNavigationPinned = ref(false);
const isTreeNavigationOpen = ref(false);
const treeNavigationRef = ref<HTMLElement | null>(null);
const mainRef = ref<HTMLElement | null>(null);
const mainDivClassOpen = 'w-9/12';
const mainDivClassClose = 'w-11/12';
const closeClass = 'w-16';
const openClass = 'w-3/12';
const localStorageKey = 'isTreeNavigationFixed';
const screenBreakpoint = 1280;

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

    if (!mainRef.value) {
        mainRef.value = document.getElementById('main-navigation');
        if (!mainRef.value) {
            console.error('main not found');
            return;
        }
    }

    isTreeNavigationOpen.value = open;

    if (open || isTreeNavigationPinned.value) {
        treeNavigationRef.value.classList.remove(closeClass);
        treeNavigationRef.value.classList.add(openClass);
        mainRef.value.classList.remove(mainDivClassClose);
        mainRef.value.classList.add(mainDivClassOpen);
        return;
    } else {
        treeNavigationRef.value.classList.remove(openClass);
        treeNavigationRef.value.classList.add(closeClass);
        mainRef.value.classList.remove(mainDivClassOpen);
        mainRef.value.classList.add(mainDivClassClose);
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
    isSmallScreen.value = window.innerWidth < screenBreakpoint;
    isTreeNavigationPinned.value = localStorage.getItem(localStorageKey) === 'true';
    openTreeNavigation(isTreeNavigationPinned.value && !isSmallScreen.value);
    addHoverListener();

    window.addEventListener('resize', async () => {
        isSmallScreen.value = window.innerWidth < screenBreakpoint;
        if (!isSmallScreen.value) {
            await nextTick();
            isTreeNavigationOpen.value = isTreeNavigationOpen.value || isTreeNavigationPinned.value
            openTreeNavigation(isTreeNavigationOpen.value);
            addHoverListener();
        } else {
            openTreeNavigation(false);
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
