<template>
    <div class="flex flex-row justify-start items-center">
        <a :href="href"   class="text-red-900 uppercase text-lg hover:underline">
            <Icon name="ph:arrow-left" class="w-5 h-5 text-black" />
            Voltar
        </a>
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