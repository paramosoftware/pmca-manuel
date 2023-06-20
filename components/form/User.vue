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
        :showNewButton="!isChangingPassword"
        @changeUserFormState="isChangingPassword = false"
        >
        
        <FieldInput label="Nome" v-if=!isChangingPassword v-model="user.name" id="name" ref="name" type="text" placeholder="Nome do usuário" />

        <FieldInput label="E-mail" v-if=!isChangingPassword v-model="user.email" id="email" type="text" placeholder="E-mail" />

        <FieldSelect label="Tipo" v-if=!isChangingPassword v-model="user.role" id="role" :options="options" :mandatory="true" />
           
        <FieldInput label="Senha" v-model="user.password" v-if="(!user.id || isChangingPassword)" id="password" ref="password" type="password" placeholder="Senha" :required="true" />

        <FieldInput label="Confirmação da senha" v-model="passwordConfirmation" v-if="(!user.id || isChangingPassword)" id="password_confirmation" type="password" placeholder="Digite a senha novamente" :required="true" />

        <div v-if="(!user.id || isChangingPassword) && (user.password != passwordConfirmation) && (passwordConfirmation !== '') ">Confirmação da senha inválida!</div>

        <div class="mt-5 text-end" v-if="(user.id && !isChangingPassword)">
            <UIButton @click="changeUserPassword" >
                Alterar senha
            </UIButton>
        </div>
    </Form>

</template>

<script setup lang="ts">

const props = defineProps<{ user?: User }>();
const passwordConfirmation = ref("");

const user = ref<User>(
    props.user ?? {
        id: 0,
        name: '',
        email: '',
        role: 2,
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

</script>

<script lang="ts">

export default {
    data() {
        return {
            isChangingPassword: false
        }
    },
    mounted () {
        this.$nextTick(() => this.$refs["name"].$el.children[1].focus());
    },
    methods: {
        changeUserPassword() {
            this.$props.user.password = "";
            this.$refs.passwordConfirmation = "";
            this.isChangingPassword = true;

            this.$nextTick(() => this.$refs["password"].$el.children[1].focus());
        }
    }
} 
 
</script>