<template>
    <ul class="list-none text-center overflow-auto whitespace-nowrap flex items-center border-b-0 pl-0 border-pmca-primary text-md">
        <li v-for="(tab, index) in tabs" :key="index" class="inline-block p-3 border-b-2 hover:border-pmca-accent hover:text-pmca-accent" 
        :class="{
            'text-pmca-accent border-b-2 border-pmca-accent': index + 1 === activeTab,
            'text-pmca-secondary-dark border-b-2 ': index + 1 !== activeTab
        }">
            
            <label :for="index + '-tab'" v-text="tab" class="cursor-pointer block" />
            <input :id="index + '-tab'" type="radio" :name="index + '-tab'" :value="index + 1" v-model="activeTab" class="hidden" />
        </li>
    </ul>
    <template v-for="(tab, index) in tabs">
        <div :key="index" v-if="index + 1 === activeTab" class="flex-grow border border-gray-200 p-4 rounded-b-md shadow-md">
            <slot :name="`tabPanel-${index + 1}`" />
        </div>
    </template>
</template>
  
<script setup lang="ts">
defineProps({
    tabs: {
        type: Array as PropType<string[]>,
        required: true,
    }
})

const emit = defineEmits(['change']);
const activeTab = ref(1);

watch(activeTab, (value) => {
    emit('change', value);
})

// TODO: Add hash to URL to keep tab state on refresh (e.g. /entry/1#tab-2)
</script>