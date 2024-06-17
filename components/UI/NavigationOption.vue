<template>
    <span
        @click="
            () => {
               
                saveLastSelectedNavigation(props.selectedNavigationMode);
                conceptStore.clear();
                
            }
        "
        class="flex flex-col items-center cursor-pointer select-none text-pmca-primary border border-gray-300 rounded p-2 transition-all ease-in-out duration-200"
        :class="[
            'hover:text-white hover:bg-pmca-green-500 hover:border-pmca-green-500',
            {
                'text-white bg-pmca-green-500 border-pmca-green-500':
                    props.navigationStylingConditionals
            }
        ]"
    >
        <UIIcon
            :placement="'top'"
            :name="`ph:${props.iconName}`"
            class="w-5 h-5"
            :title="props.dropDownTitle"
        />
        <h4 class="text-xs">{{ props.placeholder }}</h4>
    </span>
</template>

<script setup lang="ts">
const navigationStore = useNavigationStore();
const conceptStore = useConceptStore();
const props = defineProps({
    dropDownTitle: {
        type: String,
        default: 'Opção de navegação.'
    },
    placeholder: {
        type: String,
        default: 'Opção'
    },
    selectedNavigationMode: {
        type: String,
        required: true
    },
    navigationStylingConditionals: {
        type: Boolean,
        required: true
    },
    iconName: {
        type: String,
        default: 'circle-dashed'
    }
});

const saveLastSelectedNavigation = (selectedNavigation: string) => {
    localStorage.setItem('lastSelectedNavigation', selectedNavigation);
    navigationStore.setNavigationMode(selectedNavigation);
};
</script>
