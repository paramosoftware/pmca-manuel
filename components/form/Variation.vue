<template>
    <Form 
        gender-noun="f"
        singular-name="variation" 
        plural-name="variations" 
        singular-name-pt="variação" 
        plural-name-pt="variações"
        url-path="variacoes"
        :object=variation 
        :is-create="variation.id == 0" 
        :is-standalone=false
        @form-submitted="updateParent"
        >

        <FieldInput label="Variação" v-model="variation.name" id="name" type="text" placeholder="Variação" :show-label="false" :required="true" />

    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ variation?: Variation }>();

const variation = ref<Variation>(
    props.variation ?? {
        id: 0,
        name: ''
    }
);

const emit = defineEmits(['update'])

const updateParent = (variation : Variation) => {
    const { entry, ...variationWithoutEntry } = variation;
    emit('update', 'variations', 'add',  variationWithoutEntry)
}

</script>
