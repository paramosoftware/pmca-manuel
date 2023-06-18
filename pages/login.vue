<template>
  <div class="flex flex-col justify-center items-center h-screen">
    <div class="container max-w-screen-sm mx-auto p-5 bg-white border border-neutral">
      <div class="justify-between flex flex-row items-center mt-4">
        <h1 class="text-3xl text-black">Login</h1>
      </div>
      <form @submit.prevent="submit" class="mt-5">
        <FormInput label="E-mail" v-model="email" type="text" placeholder="Digite seu e-mail" />
        <FormInput label="Senha" v-model="password" type="password" placeholder="Digite sua senha" />
        <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
        <div class="mt-5 text-end">
          <Button label="ENTRAR" type="submit" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
    middleware: 'auth'
})


const email = ref("");
const password = ref("");
const errorMessage = ref("");

const router = useRouter();

const submit = async () => {

  if (!email.value || !password.value) {
    errorMessage.value = "E-mail e senha são obrigatórios";
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
    router.push('/logged');
  }

  if (error.value) {
    errorMessage.value = "E-mail ou senha inválidos";
  }
  
};

</script>
