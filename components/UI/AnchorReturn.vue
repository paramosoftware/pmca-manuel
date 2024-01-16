<template>
    <div class="flex flex-row justify-start items-center">
        <NuxtLink :to="href" class="text-pmca-secondary-dark hover:text-pmca-accent text-lg">
            <UIIcon name="ph:arrow-left" class="w-5 h-5" />
            Voltar
        </NuxtLink>
    </div>
</template>


<script setup lang="ts">
const props = defineProps({
    href: {
        type: String,
        required: true
    }
});
</script>