<template>
    <nav id="navbar" class="p-3 border-b bg-white shadow-sm rounded-sm lg:px-5">
        <div class="max-w-screen-3xl mx-auto flex flex-row">
            <div class="w-9/12 lg:w-2/6">
                <NuxtLink to="/">
                    <img
                        src="/icons/icon-horizontal.png"
                        alt="Logo"
                        class="max-w-48"
                    />
                </NuxtLink>
                <UIGlossarySelector
                    class="mt-2"
                    v-if="showGlossaryName"
                />
            </div>
            <div class="hidden lg:block w-4/6">
                <div>
                    <PublicSearchBar class="ml-auto max-w-96" v-if="showSearchBar" />
                    <PublicNavLinks
                        class="mt-2 justify-end flex items-center space-x-5"
                    />
                </div>
            </div>
            <div
                class="w-3/12 lg:hidden flex justify-end items-center space-x-3"
            >
                <NuxtLink to="/termos/selecionados">
                    <UIIcon
                        name="ph:bookmarks-simple-fill"
                        title="Termos selecionados"
                    />
                </NuxtLink>
                <UIIcon name="ph:list" title="Menu" @click="isMenuOpen = true" />
                <USlideover
                    v-model="isMenuOpen"
                    class="text-app-primary h-screen lg:hidden"
                    :ui="{
                        background: 'bg-white',
                        width: 'w-screen max-w-lg'
                    }"
                >
                    <div
                        class="flex flex-row justify-end p-2"
                    >
                        <UICloseButton @click="isMenuOpen = false" class="m-2" :is-positioned-right="false" />
                    </div>

                    <div class="px-3 pb-3 flex flex-col items-start">
                        <PublicSearchBar class="w-full mb-3" />
                        <PublicNavLinks class="flex flex-col" @link-clicked="isMenuOpen = false" />
                    </div>
                </USlideover>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
defineProps({
    showSearchBar: {
        type: Boolean,
        default: true
    },
    showGlossaryName: {
        type: Boolean,
        default: true
    }
})

const isMenuOpen = ref(false);
</script>
