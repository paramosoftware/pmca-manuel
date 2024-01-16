<template>
    <div class="flex flex-col h-screen justify-between text-pmca-primary text-lg">
        
        <HomeNavbar class="bg-white" />

        <slot class="max-w-screen-2xl"/>

        <Footer />

    </div>
</template>