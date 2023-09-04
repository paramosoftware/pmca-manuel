<template>
    <NuxtLink :to="link">
        <div class="max-w-md w-full lg:max-w-full lg:flex shadow-sm hover:shadow-md">
            <div class="w-full border border-gray-200 rounded-sm flex flex-col justify-between">

                <UIImg :src="thumbnail" :alt="entry.name" class="object-cover w-full rounded-sm" :class="height" />
                <div :class="titlePadding">

                    <div class="flex flex-row justify-between items-center">
                        <UITitle>
                            <span class="text-semibold break-words" :class="titleSize">
                                {{ entry.name }}
                            </span>
                        </UITitle>  
                        <div class="flex flex-row items-center">
                            <client-only>
                                <Icon
                                    class="text-pmca-accent text-2xl cursor-pointer" 
                                    :name="entrySelected ? 'ph:bookmark-simple-fill' : 'ph:bookmark-simple'" 
                                    @click="entrySelected = handleEntrySelection($event, entry.id)" />
                            </client-only>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </NuxtLink>
</template>
    
    
<script setup lang="ts">


const props = defineProps({
    entry: {
        type: Object,
        required: true
    },
    height: {
        type: String,
        default: 'h-60'
    },
    titleSize: {
        type: String,
        default: 'text-2xl'
    },
    titlePadding: {
        type: String,
        default: 'p-4'
    }
})

const { isSelected, handleEntrySelection } = useEntrySelection();
const entrySelected = ref(isSelected(props.entry.id));

const link = computed(() => {
    return "/verbetes/" + props.entry.slug
})

const thumbnail = computed(() => {
    if (props.entry.media.length === 0) {
        return ''
    }

    if (props.entry.media[0] && props.entry.media[0].media) {
        return props.entry.media[0].media.name
    }
})


if (process.client) {
    if (localStorage.getItem('selectedEntries') !== null) {
        const selectedEntries = JSON.parse(localStorage.getItem('selectedEntries')!)
        if (selectedEntries.includes(props.entry.id)) {
            entrySelected.value = true;
        }
    }
}

</script>
    
    
    