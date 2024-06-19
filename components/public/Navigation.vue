<template>
    <div id="container" class="flex flex-grow min-h-full shadow-lg border border-gray-200 rounded-md">
        <div
            id="left"
            class="bg-gray-50 overflow-hidden p-5 pl-10 overflow-y-auto"
        >
            <div class="flex flex-row justify-end" v-if="closed">
                <UIIcon
                    name="ph:tree-view"
                    class="hover:text-pmca-accent"
                    title="Arraste para a direita para abrir a navegação"
                    @click="openNavigation"
                />
            </div>

            <div class="bg-gray-50"
            v-show="!closed">

                <div class="flex flex-row justify-between border-b border-gray-200 bg-gray-50 mb-5">
                    <div class="text-xl font-semibold py-3">
                        <UIIcon
                            name="ph:tree-view"
                            class="mb-2"
                        />
                        Classificação
                    </div>
                    <UIIcon
                        name="ph:x"
                        class="mt-1 hover:text-pmca-accent text-xl"
                        title="Fechar navegação"
                        @click="closeNavigation"
                    />
                </div>

                <PublicHierarchicalNavigation :useConceptStoreForTree="useConceptStoreForTree" />
            </div>
        </div>
        <div
            class="w-2 hover:w-2 bg-gray-200 hover:bg-pmca-accent cursor-col-resize flex user-select-none items-center"
            id="resize"
        >
            <div></div>
        </div>
        <div
            id="right"
            class="bg-white p-5 overflow-hidden items-center shrink grow"
        >
            <PublicList :hasAlphabeticalFilter="false"/>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    useConceptStoreForTree: {
        type: Boolean,
        default: true
    }
});

const leftWidth = ref(300);
const rightWidth = ref(300);
const containerWidth = ref(600);
const container = ref<HTMLElement | null>(null);
const left = ref<HTMLElement | null>(null);
const right = ref<HTMLElement | null>(null);
const resize = ref<HTMLElement | null>(null);
const moveX = ref(0);
const dragTimer = ref(0);
const closed = ref(false);
const leftMediumWidthPercentage = 0.25;
const leftMaxWidthPercentage = 0.60;
const leftMinWidthPercentage = 0.05;

onMounted(() => {
    container.value = document.getElementById('container')!;
    left.value = document.getElementById('left')!;
    right.value = document.getElementById('right')!;
    resize.value = document.getElementById('resize')!;

    setInitialDimensions();

    moveX.value = left.value.getBoundingClientRect().width +
        resize.value.getBoundingClientRect().width / 2;

    containerWidth.value = container.value.getBoundingClientRect().width;

    let drag = false;

    resize.value.addEventListener('mousedown', function (e) {
        drag = true;
        dragTimer.value = performance.now();
        moveX.value = e.x;
    });

    container.value.addEventListener('mousemove', function (e) {
        moveX.value = e.x - container.value!.getBoundingClientRect().x; 
        if (drag) {
            leftWidth.value = moveX.value;
            rightWidth.value = container.value!.getBoundingClientRect().width - moveX.value;
            resizeSides();
        }
    });

    container.value.addEventListener('mouseup', function (e) {
        drag = false;
    });
});

function setInitialDimensions() {
    containerWidth.value = container.value!.getBoundingClientRect().width;
    leftWidth.value = containerWidth.value * 0.25;
    rightWidth.value = containerWidth.value - leftWidth.value;
    resizeSides();
}

function resizeSides() {

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

    closed.value = leftWidth.value < containerWidth.value * leftMinWidthPercentage + 100;

    left.value!.style.width = `${leftWidth.value}px`;
    right.value!.style.width = `${rightWidth.value}px`;
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



</script>
