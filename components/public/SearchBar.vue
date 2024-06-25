<template>
    <form class="flex items-center" @submit.prevent="onSearch">
        <div id="searchWrapper" class="flex h-fit w-full ">
            <FieldAutocomplete
            :id="id"
            v-model="selected"
            :placeholder="placeholder"
            :related-resource="relatedResource"
            :allow-create="allowCreate"
            :show-icon="showIcon"
            :show-selected="showSelected"
            :is-public="isPublic"
            :show-no-results="showNoResults"
            :square-right-corners="true"
            class="w-full"
            @select="onSelect"
            @input="onInput"
            size="lg"
        >
        </FieldAutocomplete>
        
        <UIButton type="submit" :square="true" class="h-full self-end max-h-10 rounded-tl-none rounded-bl-none ">
            <UIIcon name="ph:magnifying-glass" class="h-6 w-8"></UIIcon>
        </UIButton>
        </div>

    </form>
</template>

<script setup lang="ts">
const router = useRouter();

const currentInput = ref('');

const id = 'search-bar';
const placeholder = 'Pesquisar';
const allowCreate = false;
const isPublic = true;
const selected = ref([]);
const relatedResource = ref({ name: 'Concept' });
const showIcon = ref(false);
const showSelected = ref(false);
const showNoResults = ref(false);

const onInput = (value: string) => {
    currentInput.value = value;
};

const onSelect = (concept: Concept) => {
    selected.value = [];
    if (concept) {
        router.push(`/termos/${concept.nameSlug}`);
    }
};

const onSearch = () => {
    if (currentInput.value) {
        window.location.href = `/termos?search=${currentInput.value}`;
    }
};
</script>
