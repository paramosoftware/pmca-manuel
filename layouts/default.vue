<template>
    <div class="flex flex-col h-screen justify-between text-pmca-primary bg-white text-md p-2 max-w-screen-2xl mx-auto">
        
        
        <Navbar />

            <slot />

        <Footer />

        <UNotifications />

    </div>
</template>