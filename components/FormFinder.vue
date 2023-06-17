<template>
    <div class="mt-4">
        <label class="text-lg uppercase text-red-900" :for="id">
                {{ label }}
        </label>

        <div v-if ="tree.children.length > 0">
            <Finder :tree="tree" 
                @expand="onExpand" 
                :default-expanded="defaultExpanded"
                class="h-64 border border-gray-300"
                 />
        </div>
        <div v-else>
            <p class="text-gray-700">Nenhum item cadastrado para montar a hierarquia.</p>
        </div>

    </div>
</template>
  
<script setup>
import { Finder } from "@jledentu/vue-finder";
import "@jledentu/vue-finder/dist/vue-finder.css";


const props = defineProps({
    id: {
        type: String,
        required: true
    },
    itemId: {
        type: Number
    },
    modelValue: {
        type: Number,
        required: true
    },
    defaultExpanded: {
        type: String,
    },
    label: {
        type: String,
        required: true
    },
    tree: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:modelValue'])

const onExpand = ({ expanded, sourceEvent, expandedItems }) => {

    const lastExpanded = expanded[expanded.length - 1];

    if (props.itemId) {
        if (lastExpanded === props.itemId) {
            return;
        }
    }

    emit('update:modelValue', lastExpanded);
}


</script>