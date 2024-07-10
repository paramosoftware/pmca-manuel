<template>
    <div
        class="flex flex-col min-h-screen justify-between text-app-primary text-md bg-gray-50"
    >
        <Navbar class="bg-white" />

        <slot class="mx-auto max-w-screen-2xl p-2" />

        <Footer />

        <UNotifications />
    </div>

    <UILoading />
</template>
