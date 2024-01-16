<template>
  <form class="flex flex-row justify-end align-bottom" @submit.prevent="onSearch">

    <FieldAutocomplete 
      :id="id" 
      v-model="selected"
      :placeholder="placeholder"
      :related-resource="relatedResource"
      :allow-create="allowCreate"
      :show-icon="showIcon"
      :show-selected="showSelected"
      class="w-full"
      @select="onSelect"
      @input="onInput"
      size="lg"
    >
    </FieldAutocomplete>

    <UIButton type="submit" :square="true" class="h-10 mt-4">
      <UIIcon name="ph:magnifying-glass" class="h-6 w-6"></UIIcon>
    </UIButton>
  </form>
</template>


<script setup lang="ts">
const router = useRouter();


const currentInput = ref('');

const id = 'search-bar';
const placeholder = 'Pesquisar';
const allowCreate = false;
const selected = ref([]);
const relatedResource = ref({ name: 'Entry' });
const showIcon = ref(false);
const showSelected = ref(false);

const onInput = (value: string) => {
  currentInput.value = value;
};

const onSelect = (entry:  Entry) => {
  selected.value = [];
  if (entry) {
    router.push(`/verbetes/${entry.nameSlug}`);
  }
};

const onSearch = () => {
  if (currentInput.value) {
    router.push(`/verbetes?search=${currentInput.value}`);
  }
};
</script>
