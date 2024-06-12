<template>
    <div
        id="openHierarchical"
        v-if="navigationStore.isHierarchical && navigationStore.isSmallScreen"
        @click="navigationStore.onOpenHierarchicalButton()"
        :class="[
            'bg-gradient-to-t from-pmca-green-50 from-10%  to-bg-white to-90%',
            'flex flex-col justify-center items-center border-gray-200 border md:p-4 lg:p-4 mb-2 shadow-lg rounded space-x-2 text-xs font-semibold cursor-pointer bg-gray-100'
        ]"
    >
        <div>
            <UIIcon name="ph:arrows-out" class="m-0 h-5" />
            <UIIcon name="ph:arrow-bend-left-up" class="m-0 h-5" />
        </div>
    </div>
</template>

<script setup lang="ts">
const navigationStore = useNavigationStore();
</script>
