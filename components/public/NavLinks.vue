<template>
    <ul class="justify-evenly md:flex text-base mr-3 origin-top"
        :class="{ 'block absolute border-b bg-white w-full p-2': showMenu, 'hidden': !showMenu }"> 
        <li v-for="link in links" :key="link.name" :class="showMenu && 'py-2'">
            <UILink :href="link.path" class="text-2xl">
                {{ link.name }}
            </UILink>
        </li>
    </ul>
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
    }
]);


const { data, pending, error } = await useFetchWithBaseUrl('/api/web-pages');

webPages.value = data.value;

for (const webPage of webPages.value) {
    links.value.push({
        name: webPage.menuName === '' ? webPage.name : webPage.menuName,
        path: '/' + webPage.slug
    });
}

</script>