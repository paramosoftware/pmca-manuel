<template>
  <div class="flex flex-col justify-center items-center h-screen mx-10 text-pmca-primary">
    <div class="container max-w-screen-lg mx-auto p-4 border border-neutral rounded-sm m-5">

      <div class="grid grid-cols-2 gap-2 content-center items-center">
        <div class="col-span-2 md:col-span-1 flex justify-center">
          <img src="/icons/logo-pmca-full.png" alt="Logo" class="w-72" />
        </div>
        <div class="col-span-2 md:col-span-1 mt-5 md:mt-0 items-center">
          <div>
            <h1 class="text-4xl">Login</h1>
          </div>
          <form @submit.prevent="submit" class="mt-5 mx-auto">
            <FieldInput label="E-mail" v-model="email" type="text" placeholder="Digite seu e-mail" />
            <FieldInput label="Senha" v-model="password" type="password" placeholder="Digite sua senha" />
            <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
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

definePageMeta({
  layout: false,
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
