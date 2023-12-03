<template>
    <div class="flex justify-end mb-4 mt-4 sm:mt-0 sm:mb-0">
        <a v-for="item in socialMedia" :key="item.name" class="mr-2 cursor-pointer">

            <UDropdown v-if="item.options" :items="item.options" :popper="{ placement: 'bottom-end' }" 
                :ui="{ rounded: 'rounded-sm' }" class="align-middle">
                <Icon :name="item.icon" />
            </UDropdown>

            <Icon v-else :name="item.icon" @click="share(item.name)" />
        </a>
    </div>
</template>


<script setup lang="ts">


const props = defineProps({
    title: {
        type: String,
        required: true
    },
    entryId : {
         type: Number,
         required: true
    }
})

const toast = useToast()


const socialMedia = [
    {
        name: 'Baixar',
        icon: 'ph:file-pdf',
        shareUrl: ''
    },
    {
        name: 'Facebook',
        icon: 'ph:facebook-logo',
        shareUrl: 'https://www.facebook.com/sharer/sharer.php?u={url}',
    },
    {
        name: 'Twitter',
        icon: 'ph:twitter-logo',
        shareUrl: 'https://twitter.com/intent/tweet?url={url}&text={title}',

    },
    {
        name: 'WhatsApp',
        icon: 'ph:whatsapp-logo',
        shareUrl: 'https://api.whatsapp.com/send?text={title} {url}',
    },
    {
        name: 'Exportar',
        icon: 'ph:download',
        options: [
            [{
                label: 'JSON',
                click: () => {
                    exportData('Json')
                }
            }],
            [{
                label: 'CSV',
                click: () => {
                    exportData('CSV')
                }
            }],
            [{
                label: 'XLSX',
                click: () => {
                    exportData('XLSX')
                }
            }]
        ]
    }
]


const share = (name: string) => {

    let url = window.location.href
    let title = props.title

    if (name === 'Link') {
        navigator.clipboard.writeText(url)
        toast.add({ 
            title: 'Link copiado',
            ui: { rounded: 'rounded-sm', padding: 'p-5' }
        })
        return;
    }

    for (let item of socialMedia) {
        if (item.name === name) {
            if (item.shareUrl) {
                url = item.shareUrl.replace('{url}', url).replace('{title}', title)
                window.open(url, '_blank')
                return;
            }
        }
    }
}

function exportData(name: string) {
 
    var anchor = document.createElement('a');
    anchor.href = window.location.origin + '/api/entry/' + props.entryId + '?format=' + name.toLowerCase();
    anchor.target = '_blank';
    anchor.click();
    return;
}



</script>
