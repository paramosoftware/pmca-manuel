<template>
    <Form 
        gender-noun="m"
        singular-name="user" 
        plural-name="users" 
        singular-name-pt="usuário" 
        plural-name-pt="usuarios"
        :object=user 
        :is-create="user.id == 0"
        url-path="usuarios"
    >
        <FormInput label="Nome" v-if=!isChangingPassword v-model="user.name" id="name" ref="name" type="text" placeholder="Nome do usuário" />

        <FormInput label="E-mail" v-if=!isChangingPassword v-model="user.email" id="email" type="text" placeholder="E-mail" />

        <FormSelect label="Tipo" v-if=!isChangingPassword v-model="user.role" id="role" :options="options" :mandatory="true" />
           
        <FormInput label="Senha" v-model="user.password" v-if="(!user.id || isChangingPassword)" id="password" type="password" placeholder="Senha" />

        <FormInput label="Confirmação da senha" v-model="passwordConfirmation" v-if="(!user.id || isChangingPassword)" id="password_confirmation" type="password" placeholder="Digite a senha novamente" />

        <div v-if="(!user.id || isChangingPassword) && (user.password != passwordConfirmation)">Confirmação da senha inválida!</div>

        <div class="mt-5 text-end" v-if="(user.id && !isChangingPassword)">
            <Button label="ALTERAR SENHA" :on-click="changeUserPassword" />
        </div>
    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ user?: User }>();
const passwordConfirmation = ref("");
let isChangingPassword = ref(false);

const user = ref<User>(
    props.user ?? {
        id: 0,
        name: '',
        email: '',
        role: '2',
        password: '',
        refreshToken: ''
    }
);

const options = computed(() => {
    return [
        {id: "2", textValue: "padrão"},
        {id: "1", textValue: "administrador"}
    ];
});

const changeUserPassword = () => {
    props.user.password = "";
    isChangingPassword.value = true;
}

</script>