<template>
    <div
        class="flex flex-col justify-center items-center h-screen mx-3 text-app-primary bg-gray-50"
    >
        <div
            class="container max-w-screen-md mx-auto p-16 shadow-lg border border-gray-200 rounded-md m-5"
        >
            <div class="grid grid-cols-2 gap-5">
                <div class="col-span-2 md:col-span-1 mt-3 md:mt-0">
                    <div class="mb-10">
                        <UIAnchorReturn href="/" />
                    </div>
                    <div class="flex flex-col justify-center items-center">
                        <img
                            src="/icons/icon-vertical.png"
                            alt="Logo"
                            class="w-40 mx-auto align-middle"
                        />
                    </div>
                </div>

                <div class="col-span-2 md:col-span-1 mt-5 md:mt-0">
                    <div>
                        <h1 class="text-3xl">Login</h1>
                    </div>
                    <form @submit.prevent="submit" class="mt-5 mx-auto">
                        <FieldInput
                            label="Login ou e-mail"
                            v-model="email"
                            type="text"
                            placeholder="Digite seu login ou e-mail"
                            id="email"
                        />
                        <FieldInput
                            label="Senha"
                            v-model="password"
                            type="password"
                            placeholder="Digite sua senha"
                            id="password"
                        />
                        <div v-if="errorMessage" class="text-red-500">
                            {{ errorMessage }}
                        </div>
                        <div class="mt-5 text-end">
                            <UIButton label="Entrar" type="submit" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ROUTES from '~/config/routes';

definePageMeta({
    layout: false,
    middleware: 'auth'
});

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const router = useRouter();

const submit = async () => {
    if (!email.value || !password.value) {
        errorMessage.value = 'E-mail e senha são obrigatórios';
        return;
    }

    const { data, error } = await useFetchWithBaseUrl('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    });

    if (data.value) {
        router.push(ROUTES.restricted);
    }

    if (error.value) {
        errorMessage.value = 'E-mail ou senha inválidos';
    }
};
</script>
