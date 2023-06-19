<template>
    <Form 
        gender-noun="f"
        singular-name="reference" 
        plural-name="references"
        singular-name-pt="referência"
        plural-name-pt="referências"
        url-path="referencias"
        :object=reference 
        :is-create="reference.id == 0"
        @error="handleError"
        >

        <FieldQuillEditor
            id="name"
            ref="nameRef"
            required
            v-model.trim="reference.name"
            label="Referência" 
            />

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

const nameRef = ref(null);
const handleError = (error: { error: string, field: string }) => {
    const field = error.field;
    if (field == 'name') {
        nameRef.value.showError = true;
        nameRef.value.$el.children[1].focus();
    }
};

</script>
