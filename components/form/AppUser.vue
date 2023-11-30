<template>

    <Form 
        :object=object
        :gender-noun=objectConfig.genderNoun 
        :object-name=objectConfig.singular
        :object-name-plural=objectConfig.plural
        :label=objectConfig.label
        :label-plural=objectConfig.labelPlural
        :url-path=urlPath
        :is-create="object.id == 0"
        :showNewButton="!isChangingPassword"
        @changeUserFormState="isChangingPassword = false"
        >
        
        <FieldInput label="Nome" v-if=!isChangingPassword v-model="object.name" id="name" ref="name" type="text" placeholder="Nome do usuário" />

        <FieldInput label="E-mail" v-if=!isChangingPassword v-model="object.email" id="email" type="text" placeholder="E-mail" />

        <FieldSelect label="Tipo" v-if=!isChangingPassword v-model="object.role" id="role" :options="options" :mandatory="true" />
           
        <FieldInput label="Senha" v-model="object.password" v-if="(!object.id || isChangingPassword)" id="password" ref="password" type="password" placeholder="Senha" :required="true" />

        <FieldInput label="Confirmação da senha" v-model="passwordConfirmation" v-if="(!object.id || isChangingPassword)" id="password_confirmation" type="password" placeholder="Digite a senha novamente" :required="true" />

        <div v-if="(!object.id || isChangingPassword) && (object.password != passwordConfirmation) && (passwordConfirmation !== '') ">Confirmação da senha inválida!</div>

        <div class="mt-5 text-end" v-if="(object.id && !isChangingPassword)">
            <UIButton @click="changeUserPassword" >
                Alterar senha
            </UIButton>
        </div>
    </Form>

</template>

<script setup lang="ts">
import { OBJECTS } from '~/config';

const urlPath = 'usuario';
const objectConfig = OBJECTS[urlPath];

const props = defineProps<{ object?: User }>();
const passwordConfirmation = ref("");

const object = ref<User>(
    props.object ?? {
        id: 0,
        name: '',
        email: '',
        role: 2,
        password: '',
        refreshToken: ''
    }
);

if (props.object) {
    object.value.password = undefined;
}

const options = computed(() => {
    return [
        {id: "2", name: "padrão"},
        {id: "1", name: "administrador"}
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
            this.$props.object.password = "";
            this.$refs.passwordConfirmation = "";
            this.isChangingPassword = true;

            this.$nextTick(() => this.$refs["password"].$el.children[1].focus());
        }
    }
} 
 
</script>