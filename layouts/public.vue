<template>
    <div class="flex flex-col h-screen justify-between text-pmca-primary bg-white text-lg p-2 max-w-screen-2xl mx-auto">

        <PublicNavbar />

            <slot />

        <Footer />

        <UNotifications />

    </div>
</template>