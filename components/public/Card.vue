<template>
    <NuxtLink :to="link">
        <div class="lg:flex shadow-sm hover:shadow-lg text-app-secondary-500 hover:text-app-theme-500" :class="width">
            <div
                class="w-full border border-gray-200 rounded-md flex flex-col justify-between"
            >
                <UIImg
                    :src="thumbnail"
                    :alt="concept.name"
                    class="object-cover rounded-sm w-[40rem]"
                    :class="height"
                    quality="70"
                />
                <div :class="titlePadding">
                    <div
                        class="flex flex-row justify-between h-10 items-center"
                    >
                        <h3
                            class="line-clamp-2 text-semibold "
                            :class="titleSize"
                            :title="concept.name"
                        >
                            {{ concept.name }}
                        </h3>
                        <div class="flex flex-row items-center">
                            <client-only>
                                <UIIcon
                                    :class="
                                        iconSize
                                    "
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
                                        :class="
                                            iconSize
                                        "
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
    width: {
        type: String,
        default: 'w-full md:w-72 md:w-min-72 lg:w-80 xl:w-96'
    },
    height: {
        type: String,
        default: 'h-60'
    },
    titleSize: {
        type: String,
        default: 'text-xl'
    },
    titlePadding: {
        type: String,
        default: 'p-4'
    },
    iconSize: {
        type: String,
        default: 'text-xl'
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
