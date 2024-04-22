<template>
    <div
        class="flex flex-col h-screen justify-between text-pmca-primary text-lg"
    >
        <HomeNavbar class="bg-white" />

        <slot />

        <Footer />
    </div>
   <UILoading />
</template>