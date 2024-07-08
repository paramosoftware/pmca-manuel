<template>
    <div class="flex flex-row justify-start items-center">
        <UILink :to="href">
            <UIIcon name="ph:arrow-circle-left" title="Voltar" />
        </UILink>
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