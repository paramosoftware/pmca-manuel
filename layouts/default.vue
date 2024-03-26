<template>
    <div
        class="flex flex-col h-screen justify-between text-pmca-primary text-md"
    >
        <Navbar class="bg-white" />

        <slot class="mx-auto max-w-screen-2xl px-2" />

        <Footer />

        <UNotifications />
    </div>

    <UILoading />
</template>