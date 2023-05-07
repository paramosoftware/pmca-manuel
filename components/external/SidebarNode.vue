<template>
    <li>
        <span v-if="entries.length < 1">
            <ExternalSidebarLi :entry="category" :link="`/busca?categoria=`" padding="pl-0" />
        </span>

        <span v-else>
            <button type="button" class="flex items-center w-full text-base text-black transition duration-75"
                :aria-controls="dropdownName"  :data-collapse-toggle="dropdownName">
                <span class="text-lg flex-1 text-left whitespace-nowrap p-3 border-l border-red-900 hover:border-l-4">
                    {{ category }}
                </span>
                <Icon name="ph:caret-down" class="w-5 h-5 text-black transition duration-75" />
            </button>
            <ul :id="dropdownName" class="hidden py-2 space-y-2">
                <ExternalSidebarLi v-for="entry in entries" :key="entry.id" :entry="entry.name" :code="entry.code" padding="pl-8"/>
            </ul>
        </span>
    </li>
</template>

<script setup lang="ts">

const props = defineProps({
    category: {
        type: String,
        required: true
    },
    entries : {
        type: Object,
        required: true,
        default: []
    }

    
})

const dropdownName = "dropdown-" + props.category;


// TODO: go to search page with category filter when clicking on category name (layout change required)

</script>