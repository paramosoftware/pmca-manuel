<template>
    <Form 
        gender-noun="f"
        singular-name="reference" 
        plural-name="references"
        singular-name-pt="referência"
        plural-name-pt="referências"
        url-path="referencias"
        :object=reference 
        :is-create="reference.id == 0">

        <FormQuillEditor v-model="reference.name" label="Referência" id="name" />
    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ reference?: Reference }>();

const reference = ref<Reference>(
    props.reference ?? {
        id: 0,
        name: '',
    }
);
</script>
