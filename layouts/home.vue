<template>
    <div
        class="flex flex-col h-screen justify-between text-app-primary text-lg"
    >
        <PublicNavbar class="bg-white" :show-glossary-name="false" :show-search-bar="false" />

        <slot />

        <Footer />
    </div>
    <UILoading />
</template>
