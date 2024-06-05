<template>
    <form class="flex items-center" @submit.prevent="onSearch">
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
            class="w-full"
            @select="onSelect"
            @input="onInput"
            size="lg"
        >
        </FieldAutocomplete>

        <UIButton type="submit" :square="true" class="h-[2.48rem]  mt-4">
            <UIIcon name="ph:magnifying-glass" class="h-5 w-6"></UIIcon>
        </UIButton>
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
