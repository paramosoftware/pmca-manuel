<template>
    <NuxtLink :to="link">
        <div
            class="max-w-md w-full lg:max-w-full lg:flex shadow-sm hover:shadow-md"
        >
            <div
                class="w-full border border-gray-200 rounded-md flex flex-col justify-between"
            >
                <UIImg
                    :src="thumbnail"
                    :alt="concept.name"
                    class="object-cover w-full rounded-sm"
                    :class="height"
                    quality="70"
                />
                <div :class="titlePadding">
                    <div class="flex flex-row justify-between items-center">
                        <UITitle>
                            <span
                                class="text-semibold break-words"
                                :class="titleSize"
                            >
                                {{ concept.name }}
                            </span>
                        </UITitle>
                        <div class="flex flex-row items-center">
                            <client-only>
                                <UIIcon
                                    class="text-pmca-accent text-2xl cursor-pointer"
                                    :name="
                                        conceptSelected
                                            ? 'ph:bookmark-simple-fill'
                                            : 'ph:bookmark-simple'
                                    "
                                    @click="
                                        conceptSelected = toggle(
                                            $event,
                                            concept.id
                                        )
                                    "
                                />

                                <template #fallback>
                                    <UIIcon
                                        class="text-pmca-accent text-2xl cursor-pointer"
                                        name="ph:bookmark-simple"
                                    />
                                </template>
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
    concept: {
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
});

const { isSelected, toggle } = useConceptSelection();
const conceptSelected = ref(isSelected(props.concept.id));

const link = computed(() => {
    return '/termos/' + props.concept.nameSlug;
});

const thumbnail = computed(() => {
    if (props.concept.media?.length === 0) {
        return '';
    }

    if (props.concept.media[0]) {
        return props.concept.media[0].name;
    }
});

onBeforeMount(() => {
    conceptSelected.value = isSelected(props.concept.id);
});
</script>
