<template>
    <FieldCheckbox id="changePassword" v-model="changePassword" label="Alterar senha" v-if="!isCreate" />
    <template v-if="changePassword || isCreate">
        <FieldInput id="password" v-model="password" type="password" :label="isCreate ? 'Senha' : 'Nova senha'" :required="isCreate" />
    </template>
</template>


<script setup lang="ts">
const props = defineProps({
    formStore: {
        type: Object as PropType<FormStore>,
        required: true
    }
});

const changePassword = ref(false);
const password = ref('');
const isCreate = !props.formStore.getId();

props.formStore.setFieldData('password', '');

watch(password, (newVal) => {
    props.formStore.setFieldData('password', newVal);
});

</script>