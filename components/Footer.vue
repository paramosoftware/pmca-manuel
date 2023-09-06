<template>
    <footer class="mb-2 text-white mt-6">
        <div class="container">
            <div class="grid md:grid-cols-2 bg-pmca-primary-light p-4">
                <div class="flex flex-col">
                    <div class="pb-2">
                        <NuxtLink to="/login" v-if="showLoginButton">
                            <UIButton class="col-auto">
                                <Icon name="ph:sign-in" class="w-6 h-6" />
                                <span class="text-lg">Acesso interno</span>
                            </UIButton>
                        </NuxtLink>
                    </div>
                    
                    <h1 class="text-lg">
                        {{title}}
                        <span class="block" v-if="blockTitle">
                            {{ blockTitle }}
                        </span>
                    </h1>
                    <Icon name="ci:github" class="text-white p-1" />
                    <div class="text-start mt-5">
                        <p class="text-sm text-start">Projeto Manuel Correia de Andrade (PMCA)</p>
                        <p class="text-sm text-start">Desenvolvimento por Páramo Software</p>
                        <p class="text-sm text-start">2023</p>
                    </div>
                </div>
                <div class="grid grid-cols-5 mt-5 md:mt-0">
                    <div class="col-span-5 text-sm">Apoio:</div>
                    <div class="items-bottom justify-bottom flex">
                        <img src="/icons/logo-bndes.svg" alt="Logo" class="p-2 sm:p-4" />
                    </div>
                    <div class="items-bottom justify-bottom flex">
                        <img src="/icons/logo-lic.svg" alt="Logo" class="sm:p-3" />
                    </div>
                    <div class="items-bottom justify-bottom flex">
                        <img src="/icons/logo-gf.svg" alt="Logo" class="p-2 sm:p-3" />
                    </div>
                    <div class="items-bottom justify-bottom flex">
                        <img src="/icons/logo-fusp.png" alt="Logo" class="p-4 object-scale-down" />
                    </div>
                    <img src="/icons/logo-ieb.png" alt="Logo" class="p-2 sm:p-4 h-13" />
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { ROUTES } from '~/config';
const router = useRouter();

const showLoginButton = ref(false);
const path = router.currentRoute.value.path;

if (useElectron().isElectron && !path.includes(ROUTES.restricted)) {
    showLoginButton.value = true;
}

const config = useRuntimeConfig();
const title = ref(config.public.appName);
const blockTitle = ref('');

if (title.value.length > 30) {
  title.value = title.value.substring(0, title.value.indexOf(' ', 30));
  blockTitle.value = config.public.appName.replace(title.value, '');
}
</script>