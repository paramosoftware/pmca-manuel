<template>
    <div class="sm:flex sm:items-center sm:justify-between">
        <UIPageTitle class="flex items-center">
            {{ replaceHtmlEntities(name) }}
            <client-only>
                <UIIcon
                    class="text-app-theme-500 cursor-pointer ml-2 w-7"
                    :name="
                        conceptSelected
                            ? 'ph:bookmark-simple-fill'
                            : 'ph:bookmark-simple'
                    "
                    @click="conceptSelected = toggle($event, id)"
                    :title="conceptSelected ? 'Remover' : 'Adicionar'"
                />
            </client-only>
        </UIPageTitle>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: Number as PropType<number>,
        required: true
    },
    name: {
        type: String as PropType<string>,
        required: true
    }
});

const { isSelected, toggle } = useConceptSelection();

const conceptSelected = ref(isSelected(props.id));

onBeforeMount(() => {
    conceptSelected.value = isSelected(props.id);
});
</script>
