<template>
    <UICardContainer>
        <template #header>
            <UIAnchorReturn href="/admin" />
            <UIContainerTitle class="mt-5 mb-2">
                Alterar senha
            </UIContainerTitle>
        </template>

        <form @submit.prevent="onSubmit">

            <FieldInput 
                id="password" 
                label="Senha" 
                type="password" 
                v-model=password 
                :required="true" 
            />

            <FieldInput 
                id="passwordConfirmation" 
                label="Confirmação de senha" 
                type="password"
                v-model=passwordConfirmation
                :required="true"
            />

            <div class="mt-5 text-red-900" v-if="errorMessage">
                {{ errorMessage }}
            </div>

            <div class="mt-5 text-end">
                <UIButton :type='"submit"'>Alterar</UIButton>
            </div>

        </form>

    </UICardContainer>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
});

const toast = useToast();
const password = ref('');
const passwordConfirmation = ref('');
const errorMessage = ref('');

watch([password, passwordConfirmation], () => {
    errorMessage.value = '';
});

async function onSubmit() {
    if (password.value !== passwordConfirmation.value) {
        errorMessage.value = 'As senhas estão diferentes.';
        return;
    }

    const { data, error } = await useFetchWithBaseUrl('/api/auth/change-password', {
        method: 'POST',
        body: {
            password: password.value,
        }
    });

    if (error.value) {
        errorMessage.value = "Ocorreu um erro ao alterar a senha."
        return;
    }

    if (data.value) {
        password.value = '';
        passwordConfirmation.value = '';
        toast.add({
            title: 'Senha alterada com sucesso.',
            description: 'Você será redirecionado para a página inicial.',
            timeout: 5000,
            callback: () => {
                navigateTo('/admin');
            }
        });
    }
}




useHead({
    title: 'Alterar senha | ' + useRuntimeConfig().public.appName,
});
</script>