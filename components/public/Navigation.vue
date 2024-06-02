<template>
    <div
        class="flex flex-col w-full h-full shadow-lg border border-gray-200 p-4 rounded-md bg-gray-100 mb-3"
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
                ' shadow-lg border border-gray-200 rounded-md transition-all duration-300 max-h-screen bg-gray-50'
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
                            v-if="conceptsTree.length > 0"
                        />
                    </div>
                </div>
            </div>
        </aside>

        <aside v-else>
            <USlideover
                v-model="isTreeNavigationOpen"
                :overlay="false"
                class="text-pmca-primary"
            >
                <div class="flex p-4">
                    <UIIcon
                        name="ph:x"
                        class="ml-auto"
                        title="Fechar navegação"
                        @click="isTreeNavigationOpen = !isTreeNavigationOpen"
                    />

                    <UITreeView
                        :tree="conceptsTree"
                        class="mt-6"
                        v-if="conceptsTree.length > 0"
                    />
                </div>
            </USlideover>
        </aside>

        <main
            class="w-full shadow-lg border border-gray-200 rounded-md bg-white md:ml-5 p-4 h-full"
        >
            <slot></slot>
        </main>
    </div>
</template>

<script setup lang="ts">
const conceptStore = useConceptStore();
await conceptStore.fetchConceptsTree();

const { conceptsTree } = storeToRefs(conceptStore);

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
    openTreeNavigation(isTreeNavigationPinned.value && !isSmallScreen.value);
    addHoverListener();

    window.addEventListener('resize', async () => {
        isSmallScreen.value = window.innerWidth < 768;
        if (!isSmallScreen.value) {
            await nextTick();
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
