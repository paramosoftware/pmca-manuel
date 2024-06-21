<template>
    <transition name="fade" mode="out-in">
        <div
            id="openHierarchical"
            v-if="
                navigationStore.isHierarchical && navigationStore.isSmallScreen 
            "
            @click="navigationStore.toggleSlideOver()"
            :class="[
                {'bg-gradient-to-t from-pmca-green-50 from-10%  to-bg-white to-90% ': !actionsBar},
                'flex justify-center items-center border-gray-200 border md:p-4 lg:p-4 shadow-lg  rounded-tl-md rounded-bl-md md:rounded space-x-2 text-xs font-semibold cursor-pointer bg-gray-100'
            ]"
        >
            <div v-if="!actionsBar" class="flex-col flex justify-center items-center space-y-2">
                <h1 id="openTag" class="text-xs writing-mode:">Abrir</h1>
                <UIIcon name="ph:arrow-bend-left-up" class="m-0 h-5" />
            </div>
            
            <div v-if="actionsBar" class="flex-row flex justify-center items-center px-2">
                <h1 id="" class="text-xs writing-mode:">Expandir hierárquica</h1>
                <UIIcon name="ph:tree-structure" class="m-0 h-5" />
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
const navigationStore = useNavigationStore();
const props = defineProps({
    actionsBar: {
        type: Boolean,
        default: false
    }
})
</script>

<style>
#openTag {
    writing-mode: vertical-rl;
    -webkit-writing-mode: vertical-lr;
    -ms-writing-mode: vertical-lr;
}
</style>
