<template>
    <nav id="navbar" class="p-4 border-b-2 bg-white shadow-sm rounded-md">
        <div class="max-w-screen-2xl mx-auto ">
            <div class="grid grid-cols-4 md:grid-cols-12 gap-4">
                <div class="mt-1">
                    <NuxtLink to="/">
                        <img
                            src="/icons/icon-pmca.png "
                            alt="Logo"
                            class="w-14 h-14"
                        />
                    </NuxtLink>
                </div>
                <div class="col-span-3 md:col-span-4">
                    <div class="flex flex-col justify-between">
                        <h1 class="text-2xl font-semibold flex-row mb-2">
                            {{ title }}
                        </h1>
                    </div>
                </div>
                <div
                    class="block md:hidden text-right align-middle col-span-4 md:col-span-0 mr-3"
                >
                    <NuxtLink to="/termos-selecionados">
                        <UIIcon
                            class="text-pmca-accent w-9 h-9 cursor-pointer mr-2"
                            name="ph:bookmarks-simple-fill"
                            title="Termos selecionados"
                        />
                    </NuxtLink>
                    <NuxtLink to="/admin" v-if="isElectronApp">
                        <UIIcon
                            class="text-pmca-accent text-2xl cursor-pointer ml-2"
                            name="ph:sign-in"
                            title="Acesso interno"
                        />
                    </NuxtLink>
                    <button
                        @click="showMenu = !showMenu"
                        type="button"
                        aria-controls="navbar-main"
                        aria-expanded="false"
                        aria-label="Abrir menu"
                    >
                        <UIIcon name="ph:list" class="w-9 h-9" />
                    </button>
                </div>
                <div class="col-span-1 md:col-span-1"></div>
                <div class="col-span-4 md:col-span-6 relative mr-3 lg:mr-0">
                    <PublicSearchBar />
                </div>
            </div>
            <div class="mt-4">
                <PublicNavLinks
                    :show-menu="showMenu"
                    @update:show-menu="showMenu = $event"
                />
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
const showMenu = ref(false);
const isElectronApp = isElectron();

const config = useRuntimeConfig();
const title = ref(config.public.appName);
</script>
