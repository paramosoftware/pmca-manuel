<template>
    <nav id="navbar" class="p-4 border-b-2 bg-white shadow-sm rounded-md">
        <div class="max-w-screen-2xl mx-auto">
            <div class="grid grid-cols-4 md:grid-cols-12 md:gap-2">
                <div class="mt-1">
                    <NuxtLink to="/">
                        <img
                            src="/icons/icon-horizontal.png"
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
                        <p class="text-sm text-gray-500 truncate">
                            {{ glossaryName }}
                        </p>
                    </div>
                </div>
                <div
                    id="menuOpen"
                    class="flex justify-end md:hidden row-start-2 col-start-3 col-span-2"
                >
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

                <div
                    class="flex items-center md:hidden text-right align-middle col-span-2 md:col-span-0 mr-0 p-0 md:mr-3"
                    :class="[
                        { 'justify-between': isElectronApp },
                        { 'justify-start': !isElectronApp }
                    ]"
                >
                    <NuxtLink
                        to="/termos-selecionados"
                        class="flex justify-center"
                    >
                        <UIIcon
                            class="text-app-theme-500 w-9 h-9 cursor-pointer mr-0 md:mr-2"
                            name="ph:bookmarks-simple-fill"
                            title="Termos selecionados"
                        />
                    </NuxtLink>
                    <NuxtLink
                        to="/admin"
                        class="w-1/4 flex justify-center"
                        v-if="isElectronApp"
                    >
                        <UIIcon
                            class="text-app-theme-500 text-2xl cursor-pointer ml-2"
                            name="ph:sign-in"
                            title="Acesso interno"
                        />
                    </NuxtLink>
                </div>

                <div
                    class="col-span-4 md:col-span-7 flex relative m-0 md:mr-3 lg:mr-0"
                >
                    <PublicSearchBar
                        :navbar="true"
                        class="flex-grow px-0 md:px-6"
                    />
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
const glossaryStore = useGlossaryStore();
await glossaryStore.fetch();
const { name: glossaryName } = storeToRefs(glossaryStore);

const config = useRuntimeConfig();
const title = ref(config.public.appName);
</script>
