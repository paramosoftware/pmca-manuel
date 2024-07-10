<template>
    <nav
        class="flex min-w-0 mb-3 overflow-auto whitespace-nowrap"
        draggable="true"
    >
        <ol class="flex items-center gap-x-1.5">
            <li
                class="flex items-center gap-x-1.5 text-app-secondary-500 text-sm leading-6 min-w-0"
                v-for="(link, index) in linkItems"
            >
                <NuxtLink
                    :to="link.to"
                    class="flex items-center gap-x-1.5 group font-semibold min-w-0 hover:text-app-theme-500"
                >
                    <UIIcon
                        v-if="link.icon"
                        :name="link.icon"
                        class="flex-shrink-0 w-5 h-5"
                    />
                    <span>{{ link.label }}</span>
                </NuxtLink>
                <span v-if="index < linkItems.length - 1">
                    <UIIcon name="ph:caret-right" class="w-3 h-3" />
                </span>
            </li>
        </ol>
    </nav>
</template>

<script setup lang="ts">
const props = defineProps({
    useConceptStore: {
        type: Boolean,
        default: false
    },
    addConceptLink: {
        type: Boolean,
        default: true
    }
});

const home = {
    label: 'Início',
    to: '/',
    icon: 'ph:house'
};

const concepts = {
    label: 'Termos',
    to: '/termos',
    icon: 'ph:cards-three'
};

const conceptStore = useConceptStore();

const { conceptIdentifier, ancestors } = storeToRefs(conceptStore);

const linkItems = computed(() => buildBreadcrumb());

watch(
    () => conceptIdentifier.value,
    () => {
        buildBreadcrumb();
    }
);

function buildBreadcrumb() {
    const breadcrumb = [home];

    if (props.addConceptLink) {
        breadcrumb.push(concepts);
    }

    if (!props.useConceptStore) {
        return breadcrumb;
    }

    if (conceptIdentifier.value && ancestors.value) {
        ancestors.value.forEach((ancestor: Concept) => {
            breadcrumb.push({
                label: ancestor.name,
                to: '/termos/' + ancestor.nameSlug,
                icon: 'ph:article'
            });
        });
    }

    return breadcrumb;
}
</script>

<style scoped>
::-webkit-scrollbar {
    height: 3px;
}
</style>
