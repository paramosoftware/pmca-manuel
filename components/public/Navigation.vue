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
                :use-concept-store-for-tree="useConceptStoreForTree"
                :closed="closed"
                :open-navigation="openNavigation"
                :close-navigation="closeNavigation"
                :is-slide-over-open="isSlideOverOpen"
                @slide-over-close="isSlideOverOpen = false"
            />
        </div>
        <div
            class="w-2 hover:w-2 bg-gray-200 hover:bg-pmca-accent cursor-col-resize user-select-none items-center hidden lg:flex"
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
                :title="!isDiagram ? title : ''"
                :show-breadcrumb="!isDiagram"
                :has-header="!isDiagram"
            >
                <template #actions-title> Visualizações: </template>
                <template #actions-icons>
                    <UIIcon
                        v-for="visualization in views"
                        :key="visualization.name"
                        :name="visualization.icon"
                        :title="visualization.title"
                        :class="{
                            'text-pmca-accent': currentView === visualization.id
                        }"
                        class="hover:text-pmca-accent"
                        @click="changeView(visualization.id)"
                    />
                </template>

                <template #actions-sub-title v-if="isHierarchical">
                    Abrir classificação:
                </template>
                <template #actions-sub-icons v-if="isHierarchical">
                    <UIIcon
                        name="ph:tree-view"
                        title="Abrir classificação"
                        class="hover:text-pmca-accent"
                        @click="isSlideOverOpen = true"
                    />
                </template>

                <PublicList
                    :hasAlphabeticalFilter="isAlphabetical"
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

const currentView = ref('diagram');
const isHierarchical = computed(() => currentView.value === 'hierarchical');
const isDiagram = computed(() => currentView.value === 'diagram');
const isAlphabetical = computed(() => currentView.value === 'alphabetical');
const showLeftSide = computed(() => isHierarchical.value === true);
const showList = computed(
    () =>
        (currentView.value === 'alphabetical' || isHierarchical.value) &&
        !props.individualCard
);
const isSlideOverOpen = ref(false);
const leftWidth = ref(300);
const rightWidth = ref(300);
const containerWidth = ref(600);
const containerRef = ref<HTMLElement | null>(null);
const leftRef = ref<HTMLElement | null>(null);
const rightRef = ref<HTMLElement | null>(null);
const resizeRef = ref<HTMLElement | null>(null);
const moveX = ref(0);
const closed = ref(false);
const leftMediumWidthPercentage = 0.25;
const leftMaxWidthPercentage = 0.6;
const leftMinWidthPercentage = 0.05;
const drag = ref(false);

onMounted(() => {
    setInitialDimensions();
    setResizeListeners();
});

onUpdated(() => {
    if (isHierarchical.value) {
        setResizeListeners();
    }
});

function setInitialDimensions() {
    if (!setHTMLReferences()) {
        return;
    }

    moveX.value =
        leftRef.value.getBoundingClientRect().width +
        resizeRef.value.getBoundingClientRect().width / 2;
    containerWidth.value = containerRef.value!.getBoundingClientRect().width;
    leftWidth.value = containerWidth.value * 0.25;
    rightWidth.value = containerWidth.value - leftWidth.value;
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
}

function setHTMLReferences() {
    if (!isHierarchical.value) {
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
}
</script>
