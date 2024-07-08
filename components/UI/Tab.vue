<template>
    <ul
        class="list-none text-center overflow-auto whitespace-nowrap flex items-center border-b-0 pl-0 border-app-primary text-md"
    >
        <li
            v-for="(tab, index) in tabs"
            :key="index"
            class="inline-block p-3 border-b-2 hover:border-app-theme-500 hover:text-app-theme-500"
            :class="{
                'text-app-theme-500 border-b-2 border-app-theme-500':
                    index + 1 === activeTab,
                'text-app-theme-400 border-b-2 ': index + 1 !== activeTab
            }"
        >
            <label
                :for="index + '-tab'"
                v-text="tab"
                class="cursor-pointer block"
            />
            <input
                :id="index + '-tab'"
                type="radio"
                :name="index + '-tab'"
                :value="index + 1"
                v-model="activeTab"
                class="hidden"
            />
        </li>
    </ul>
    <template v-for="(tab, index) in tabs">
        <div
            :key="index"
            v-if="index + 1 === activeTab"
            class="flex-grow border-t border-gray-200 p-4"
        >
            <slot :name="`tabPanel-${index + 1}`" />
        </div>
    </template>
</template>

<script setup lang="ts">
defineProps({
    tabs: {
        type: Array as PropType<string[]>,
        required: true
    }
});

const emit = defineEmits(['change']);
const activeTab = ref(1);

watch(activeTab, (value) => {
    emit('change', value);
});

// TODO: Add hash to URL to keep tab state on refresh (e.g. /concept/1#tab-2)
</script>

<style scoped>
::-webkit-scrollbar {
    height: 3px;
}
</style>
