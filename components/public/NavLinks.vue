<template>
    <div class="text-xl">
        <ul v-for="link in links" :key="link.name">
            <UILink :to="link.path" :active="currentPath === link.path || link.partial && currentPath.includes(link.path)">
                <li @click="emit('link-clicked')">
                    {{ link.name }}
                </li>
            </UILink>
        </ul>
        <NuxtLink to="/termos/selecionados" class="hidden lg:block" @click="emit('link-clicked')">
            <UIIcon
                name="ph:bookmarks-simple-fill"
                title="Termos selecionados"
                :active="currentPath === '/termos/selecionados'"
            />
        </NuxtLink>
        <NuxtLink to="/admin" v-if="isElectronApp" class="hidden lg:block" @click="emit('link-clicked')">
            <UIIcon
                name="ph:sign-in"
                title="Acesso interno"
            />
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
const isElectronApp = isElectron();

const emit = defineEmits(['link-clicked']);

const webPages = ref(<WebPage[]>[]);

const links = ref([
    {
        name: 'Termos',
        path: '/termos'
    },
    {
        name: 'Fontes',
        path: '/fontes'
    },
    {
        name: 'Exportar',
        path: '/exportar'
    },
    {
        name: 'Download',
        path: '/download'
    },
    {
        name: 'Sobre',
        path: '/sobre'
    },
    {
        name: 'Manual',
        path: '/manual',
        partial: true
    }
]);

const { data, pending, error } = await useFetchWithBaseUrl(
    '/api/public/webPage'
);

const currentPath = computed(() => {
    return useRoute().path;
});

webPages.value = data.value.items ?? [];

for (const webPage of webPages.value) {
    links.value.push({
        name: webPage.menuName === '' ? webPage.name : webPage.menuName,
        path: '/' + webPage.nameSlug
    });
}
</script>
