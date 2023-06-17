<template>
    <Form singular-name="user" plural-name="users" singular-name-pt="usuario" plural-name-pt="usuarios"
        :object=user :is-create="user.id == 0">

        <FormInput label="Nome" v-model="user.name" id="name" ref="name" type="text" placeholder="Nome do usuário" />

        <FormInput label="E-mail" v-model="user.email" id="email" type="text" placeholder="E-mail" />
           
        <FormInput label="Senha" v-model="user.password" id="password" type="text" placeholder="Senha" />
    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ user?: User }>();

const user = ref<User>(
    props.user ?? {
        id: 0,
        name: '',
        email: '',
        password: '',
        refreshToken: ''
    }
);

const { data: users } = await useFetchWithBaseUrl('/api/users');

</script>