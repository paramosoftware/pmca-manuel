<template>
    <div class="flex flex-col h-screen justify-between text-pmca-primary text-md p-2">
        
        <Navbar />

            <slot />

        <Footer />

    </div>
</template>



<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
})
</script>