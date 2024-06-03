<template>
    <nav
        class="flex min-w-0 mb-3 overflow-auto whitespace-nowrap"
        draggable="true"
    >
        <ol class="flex items-center gap-x-1.5">
            <li
                class="flex items-center gap-x-1.5 text-gray-500 text-sm leading-6 min-w-0"
                v-for="(link, index) in linkItems"
            >
                <NuxtLink
                    :to="link.to"
                    class="flex items-center gap-x-1.5 group font-semibold min-w-0 hover:text-pmca-accent"
                    :aria-current="link.active ? 'page' : undefined"
                >
                    <UIIcon
                        v-if="link.icon"
                        :name="link.icon"
                        class="flex-shrink-0 w-5 h-5"
                    />
                    <span>{{ link.label }}</span>
                </NuxtLink>
                <span v-if="index < linkItems.length - 1">
                    <UIIcon
                        name="ph:caret-right"
                        class="text-gray-500 w-3 h-3"
                    />
                </span>
            </li>
        </ol>
    </nav>
</template>

<script setup lang="ts">
const props = defineProps({
    links: {
        type: Array<Link>,
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

const linkItems = ref<Link[]>([home]);

if (props.addConceptLink) {
    linkItems.value.push(concepts);
}

if (props.links) {
  linkItems.value.push(...props.links);
}
</script>

<style scoped>
::-webkit-scrollbar {
    height: 3px;
}
</style>
