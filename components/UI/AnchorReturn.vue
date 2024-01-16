<template>
    <div class="flex flex-row justify-start items-center">
        <NuxtLink :to="href">
            <UIIcon name="ph:arrow-circle-left" class="w-8 h-8" title="Voltar" />
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