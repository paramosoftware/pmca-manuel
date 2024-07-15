<template>
    <div
        id="container"
        class="flex flex-grow min-h-full shadow-lg border-gray-200 rounded-lg border"
    >
        <div
            id="left"
            ref="leftRef"
            class="bg-gray-50 overflow-hidden p-5 pl-10 overflow-y-auto hidden lg:block"
            v-if="showLeftSide"
        >
            <PublicNavigationLeftSide
                :use-concept-store-for-tree="isHierarchical && !individualCard"
                :closed="closed"
                :open-navigation="openNavigation"
                :close-navigation="closeNavigation"
                :is-slide-over-open="isSlideOverOpen"
                @slide-over-close="isSlideOverOpen = false"
            />
        </div>
        <div
            class="w-2 hover:w-2 bg-gray-200 hover:bg-app-theme-500 cursor-col-resize user-select-none items-center hidden lg:flex"
            id="resize"
            ref="resizeRef"
            v-if="showLeftSide"
        >
            <div></div>
        </div>
        <div
            id="right"
            class="bg-white overflow-hidden items-center shrink grow"
            ref="rightRef"
        >
            <PublicPage
                :title="showHeader ? title : ''"
                :show-breadcrumb="showHeader"
                :has-header="showHeader"
                :add-horizontal-line="showHeader"
                :add-border="false"
            >
                <template #actions-title>
                    {{ showActions ? 'Ações:' : 'Visualizações:' }}
                </template>
                <template #actions-icons>
                    <UIIcon
                        v-for="visualization in views"
                        :key="visualization.name"
                        :name="visualization.icon"
                        :title="visualization.title"
                        :base="currentView === visualization.id ? 'text-app-theme-500' : ''"
                        @click="changeView(visualization.id)"
                        v-if="!showActions"
                    />
                    <PublicActionsBar v-else :user-selection="userSelection" />
                </template>

                <template #actions-sub-title v-if="showLeftSide">
                    Abrir classificação:
                </template>
                <template #actions-sub-icons v-if="showLeftSide">
                    <UIIcon
                        name="ph:tree-view"
                        title="Abrir classificação"
                        class="hover:text-app-theme-500"
                        @click="isSlideOverOpen = true"
                    />
                </template>

                <PublicList
                    :hasAlphabeticalFilter="isAlphabetical && !userSelection"
                    :user-selection="userSelection"
                    v-if="showList"
                />

                <PublicFullCard v-else-if="individualCard" />

                <PublicDiagram v-else-if="isDiagram" />
            </PublicPage>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        default: 'Termos'
    },
    individualCard: {
        type: Boolean,
        default: false
    },
    userSelection: {
        type: Boolean,
        default: false
    },
    useConceptStoreForTree: {
        type: Boolean,
        default: true
    }
});

const views = ref([
    {
        id: 'hierarchical',
        name: 'Hierárquica',
        icon: 'ph:tree-view',
        title: 'Visualização hierárquica (classificação)'
    },
    {
        id: 'alphabetical',
        name: 'Alfabética',
        title: 'Visualização alfabética',
        icon: 'ph:text-aa'
    },
    {
        id: 'diagram',
        name: 'Diagrama',
        title: 'Visualização em diagrama',
        icon: 'ph:arrows-split'
    }
]);

const conceptStore = useConceptStore();
const currentView = ref('hierarchical');
const isHierarchical = computed(() => currentView.value === 'hierarchical');
const isDiagram = computed(() => currentView.value === 'diagram');
const isAlphabetical = computed(() => currentView.value === 'alphabetical');
const showLeftSide = computed(
    () =>
        (isHierarchical.value === true || props.individualCard === true) &&
        !props.userSelection
);
const showList = computed(
    () =>
        (isAlphabetical.value || isHierarchical.value || props.userSelection) &&
        !props.individualCard
);
const showHeader = computed(() => !isDiagram.value && !props.individualCard);
const showActions = computed(() => props.individualCard || props.userSelection);

const isSlideOverOpen = ref(false);
const leftWidth = ref(300);
const rightWidth = ref(300);
const containerWidth = ref(600);
const containerRef = ref<HTMLElement | null>(null);
const leftRef = ref<HTMLElement | null>(null);
const rightRef = ref<HTMLElement | null>(null);
const resizeRef = ref<HTMLElement | null>(null);
const moveX = ref(0);
const closed = ref(true);
const leftMediumWidthPercentage = 0.25;
const leftMaxWidthPercentage = 0.5;
const leftMinWidthPercentage = 0.05;
const drag = ref(false);

watch(
    () => props.individualCard,
    () => {
        if (props.individualCard === false) {
            conceptStore.resetConcept();
        }
    }
);

onMounted(() => {
    if (props.individualCard === false) {
        conceptStore.resetConcept();
    }

    if (showLeftSide.value) {
        setInitialDimensions();
        setResizeListeners();
    }
});

onUpdated(() => {
    if (showLeftSide.value) {
        setInitialDimensions();
        setResizeListeners();
    }

    if (props.individualCard === false) {
        conceptStore.resetConcept();
    }

    if (!isAlphabetical.value) {
        conceptStore.resetFilters();
    }
});

onUnmounted(() => {
    window.removeEventListener('resize', setInitialDimensions);
});

function setInitialDimensions() {
    if (!setHTMLReferences()) {
        return;
    }

    const leftClientWidth = leftRef.value!.getBoundingClientRect().width;
    const resizeClientWidth = resizeRef.value!.getBoundingClientRect().width;

    moveX.value = leftClientWidth + resizeClientWidth / 2;
    containerWidth.value = containerRef.value!.getBoundingClientRect().width;

    leftWidth.value = containerWidth.value * leftMediumWidthPercentage;
    rightWidth.value = containerWidth.value - leftWidth.value;
    getStoredNavigationConfig();
    resizeSides();
}

function resizeSides() {
    if (!setHTMLReferences()) {
        return;
    }

    const leftMaxWidth = containerWidth.value * leftMaxWidthPercentage;

    if (leftWidth.value > leftMaxWidth) {
        leftWidth.value = leftMaxWidth;
        rightWidth.value = containerWidth.value - leftWidth.value;
    }

    const leftMinWidth = containerWidth.value * leftMinWidthPercentage;

    if (leftWidth.value < leftMinWidth) {
        leftWidth.value = leftMinWidth;
        rightWidth.value = containerWidth.value - leftWidth.value;
    }

    closed.value =
        leftWidth.value < containerWidth.value * leftMinWidthPercentage + 100;

    leftRef.value!.style.width = `${leftWidth.value}px`;
    rightRef.value!.style.width = `${rightWidth.value}px`;

    saveNavigationConfig();
}

function openNavigation() {
    leftWidth.value = leftMediumWidthPercentage * containerWidth.value;
    rightWidth.value = containerWidth.value - leftWidth.value;
    resizeSides();
}

function closeNavigation() {
    leftWidth.value = leftMinWidthPercentage * containerWidth.value;
    rightWidth.value = containerWidth.value - leftWidth.value;
    resizeSides();
}

function changeView(view: string) {
    currentView.value = view;
    saveNavigationConfig();
}

function setHTMLReferences() {
    if (!showLeftSide.value) {
        return false;
    }

    if (!containerRef.value) {
        containerRef.value = document.getElementById('container');
    }

    if (!leftRef.value) {
        leftRef.value = document.getElementById('left');
    }

    if (!rightRef.value) {
        rightRef.value = document.getElementById('right');
    }

    if (!resizeRef.value) {
        resizeRef.value = document.getElementById('resize');
    }

    if (
        !containerRef.value ||
        !leftRef.value ||
        !rightRef.value ||
        !resizeRef.value
    ) {
        console.error('One or more HTML elements are missing', {
            containerRef: containerRef.value,
            leftRef: leftRef.value,
            rightRef: rightRef.value,
            resizeRef: resizeRef.value
        });

        return false;
    }

    return true;
}

function setResizeListeners() {
    if (!setHTMLReferences()) {
        return;
    }

    window.addEventListener('resize', setInitialDimensions);

    resizeRef.value!.addEventListener('mousedown', function (e) {
        drag.value = true;
        moveX.value = e.x;
    });

    containerRef.value!.addEventListener('mousemove', function (e) {
        moveX.value = e.x - containerRef.value!.getBoundingClientRect().x;
        if (drag.value) {
            leftWidth.value = moveX.value;
            rightWidth.value =
                containerRef.value!.getBoundingClientRect().width - moveX.value;
            resizeSides();
        }
    });

    containerRef.value!.addEventListener('mouseup', function (e) {
        drag.value = false;
    });

    saveNavigationConfig();
}

function getStoredNavigationConfig() {
    const storedConfig = localStorage.getItem('navigationConfig');

    if (storedConfig && setHTMLReferences()) {
        const config = JSON.parse(storedConfig);

        const containerWidth =
            containerRef.value!.getBoundingClientRect().width;

        const storedContainerWidth = config.containerWidth ?? 0;

        const containerWidthDifference = Math.abs(
            containerWidth - storedContainerWidth
        );

        if (containerWidthDifference > containerWidth * 0.1) {
            return false;
        } else if (containerWidthDifference <= containerWidth * 0.1) {
            const leftWidthPercentage = config.leftWidth / storedContainerWidth;
            const rightWidthPercentage =
                config.rightWidth / storedContainerWidth;
            leftWidth.value = containerWidth * leftWidthPercentage;
            rightWidth.value = containerWidth * rightWidthPercentage;
        } else {
            leftWidth.value = containerWidth * leftMediumWidthPercentage;
            rightWidth.value = containerWidth - leftWidth.value;
        }

        if (config.closed) {
            closed.value = config.closed;
        }

        if (config.currentView) {
            currentView.value = config.currentView;
        }

        return true;
    }

    return false;
}

function saveNavigationConfig() {
    localStorage.setItem(
        'navigationConfig',
        JSON.stringify({
            leftWidth: leftWidth.value,
            rightWidth: rightWidth.value,
            closed: closed.value,
            currentView: currentView.value,
            containerWidth: containerWidth.value
        })
    );
}
</script>
