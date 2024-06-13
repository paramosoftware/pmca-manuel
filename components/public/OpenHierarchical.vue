<template>
    <transition name="fade" mode="out-in">
    <div
        id="openHierarchical"
        v-if="navigationStore.isHierarchical && navigationStore.isSmallScreen"
        @click="navigationStore.toggleSlideOver()"
        :class="[
            'bg-gradient-to-t from-pmca-green-50 from-10%  to-bg-white to-90%',
            'flex justify-center items-center border-gray-200 border md:p-4 lg:p-4 mb-2 shadow-lg  rounded-tl-md rounded-bl-md md:rounded space-x-2 text-xs font-semibold cursor-pointer bg-gray-100'
        ]"
    >
        <div class="flex-col flex">
            <UIIcon name="ph:arrows-out" class="m-0 h-5" />
            <UIIcon name="ph:arrow-bend-left-up" class="m-0 h-5" />
        </div>
    </div>
</transition>
</template>

<script setup lang="ts">
const navigationStore = useNavigationStore();
</script>
