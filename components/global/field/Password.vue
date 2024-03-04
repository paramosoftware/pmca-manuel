<template>
    <FieldCheckbox id="changePassword" v-model="changePassword" label="Alterar senha" v-if="!isCreate" />
    <template v-if="changePassword || isCreate">
        <FieldInput id="password" v-model="password" type="password" :label="isCreate ? 'Senha' : 'Nova senha'" :required="isCreate || changePassword" />
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

props.formStore.unsetFieldData('password');

watch(password, (newVal) => {
    props.formStore.setFieldData('password', newVal);
});

watch(changePassword, (newVal) => {
    if (!newVal) {
        password.value = '';
        props.formStore.unsetFieldData('password');
    }
});

</script>