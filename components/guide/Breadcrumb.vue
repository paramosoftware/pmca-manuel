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
                    class="flex items-center gap-x-1.5 group font-semibold min-w-0"
                    :class="[
                        link.to.length > 0 ? 'hover:text-app-theme-500 ' : ''
                    ]"
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

const guide = {
    label: 'Manual',
    to: '/manual',
    icon: 'ph:cards-three'
};

const route = useRoute();
const currentGuideItemPath = computed(() => {
    return '/' + route.path.split('/').slice(2).join('/');
});

const { data: navigation } = await useAsyncData('navigation', () =>
    fetchContentNavigation()
);

const linkItems = computed(() => buildBreadcrumb());

watch(
    () => navigation,
    () => {
        buildBreadcrumb();
    }
);
const findTargetNode = (node, targetPath) => {
    if (node._path === targetPath) {
        return [node];
    }
    if (node.children) {
        for (const children of node.children) {
            const result = findTargetNode(children, targetPath);
            if (result) {
                console.log([node, ...result]);
                return [node, ...result];
            }
        }
    }
    return null;
};

function buildBreadcrumb() {
    const breadcrumb = [home];
    let activePath = null;
    for (const root of navigation.value) {
        activePath = findTargetNode(root, currentGuideItemPath.value);
        if (activePath) {
            break;
        }
    }
    breadcrumb.push(guide);
    if (!activePath) {
        return breadcrumb;
    }

    for (const node of activePath) {
        let crumb = {
            label: node.title,
            to: '',
            icon: 'ph:article'
        };
        if (node.children) {
            crumb.icon = 'ph:tag-simple';
        } else {
            crumb.to = `/manual${node._path}`;
        }

        breadcrumb.push(crumb);
    }
    return breadcrumb;
}
</script>

<style scoped>
::-webkit-scrollbar {
    height: 3px;
}
</style>
