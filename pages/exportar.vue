<template>
    <PublicPage title="Exportar">
        <UIExport :public="true"/>
    </PublicPage>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});
</script>
