<template>
    <div class="grid grid-cols-12">
        <div class="col-span-11">
            <ul class="justify-evenly md:flex text-base mr-3 origin-top"
                :class="{ 'block absolute border-b bg-white w-full p-2': showMenu, 'hidden': !showMenu }">
                <li v-for="link in links" :key="link.name" :class="showMenu && 'py-2'">
                    <UILink :href="link.path" class="text-2xl">
                        {{ link.name }}
                    </UILink>
                </li>
            </ul>
        </div>
        <div class="hidden md:flex col-span-1 text-end mr-3 md:mr-0"> 
            <NuxtLink to="/verbetes/selecionados">
                <Icon class="text-pmca-accent text-2xl cursor-pointer" name="ph:bookmarks-simple-fill" />
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    showMenu : Boolean
})

const showMenu = computed(() => props.showMenu);
const webPages = ref(<WebPage[]>[]);

const emit = defineEmits(['update:showMenu']);

if (process.client) {
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        emit('update:showMenu', false);
    }
  });
}

const links = ref([
    {
        name: 'Verbetes',
        path: '/verbetes'
    },
    {
        name: 'Exportar',
        path: '/exportar'
    }
]);


const { data, pending, error } = await useFetchWithBaseUrl('/api/webPage');

webPages.value = data.value.items ?? [];

for (const webPage of webPages.value) {
    links.value.push({
        name: webPage.menuName === '' ? webPage.name : webPage.menuName,
        path: '/' + webPage.nameSlug
    });
}
</script>