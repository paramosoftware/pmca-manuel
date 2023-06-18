<template>
    <Form singular-name="user" plural-name="users" singular-name-pt="usuario" plural-name-pt="usuarios"
        :object=user :is-create="user.id == 0">

        <FormInput label="Nome" v-model="user.name" id="name" ref="name" type="text" placeholder="Nome do usuário" />

        <FormInput label="E-mail" v-model="user.email" id="email" type="text" placeholder="E-mail" />

        <FormSelect label="Tipo" v-model="user.role" id="role" :options="options" :mandatory="true" />
           
        <FormInput label="Senha" v-model="user.password" v-if="user.id" id="password" type="password" placeholder="Senha" />
    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ user?: User }>();

const user = ref<User>(
    props.user ?? {
        id: 0,
        name: '',
        email: '',
        role: '1',
        password: '',
        refreshToken: ''
    }
);

const options = computed(() => {
    return [
        {id: "2", textValue: "padrão"},
        {id: "1", textValue: "administrador"}
    ];
})

</script>
