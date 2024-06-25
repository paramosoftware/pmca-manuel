<template>
    <PublicListInputFilter />

    <PublicListAlphabeticalFilter v-if="hasAlphabeticalFilter" />

    <PublicListPageControls />

    <PublicListGrid />

    <PublicListPageControls :top="false" />
</template>

<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        default: 'Termos'
    },
    userSelection: {
        type: Boolean,
        default: false
    },
    hasTree: {
        type: Boolean,
        default: true
    },
    hasAlphabeticalFilter: {
        type: Boolean,
        default: true
    }
});

const conceptStore = useConceptStore();
await conceptStore.load('', props.userSelection);
await conceptStore.fetchConceptsTree();

const { search } = storeToRefs(conceptStore);

const userSelection = computed(() => {
    return props.userSelection;
});

const route = useRoute()
const router = useRouter()

onMounted(async () => {
   if (route.query.search) {
       search.value = route.query.search as string;
   }

    watch(search, () => {
         router.push({ query: {}});
    },
    { once: true }
    );
});

watch(userSelection, async () => {
    await conceptStore.load('', true);
});
</script>
