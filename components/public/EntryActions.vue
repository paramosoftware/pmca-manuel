<template>
    <div class="mt-4 w-3/4">
        <UITitle>Compartilhar</UITitle>
        <div class="flex flex-row mt-2">
            <a v-for="item in socialMedia" :key="item.name" :href="item.link" class="mr-2">
                <span class="sr-only">{{ "Compartilhar no " + item.name }}</span>
                <Icon :name="item.icon" />
            </a>


        </div>
    </div>
    <div class="mt-4 w-1/4">
        <UITitle>Baixar</UITitle>
        <div class="flex flex-row mt-2">
            <a href="#" class="mr-2">
                <Icon name="ph:file-pdf" />
            </a>
        </div>
    </div>
</template>


<script setup lang="ts">
const socialMedia = [
    {
        name: 'Facebook',
        icon: 'ph:facebook-logo',
        link: '#'
    },
    {
        name: 'Twitter',
        icon: 'ph:twitter-logo',
        link: '#'
    },
    {
        name: 'WhatsApp',
        icon: 'ph:whatsapp-logo',
        link: '#'
    },
    {
        name: 'Link',
        icon: 'ph:link',
        link: '#'
    }
]
</script>