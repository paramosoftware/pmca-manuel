<template>
        <div class="flex justify-between mb-4 mt-4 sm:mt-0">
            <div>
                <client-only>
                    <Icon class="text-pmca-accent cursor-pointer" 
                        :name="entrySelected ? 'ph:bookmark-simple-fill' : 'ph:bookmark-simple'" 
                        @click="saveSelection(entryId)" />
                </client-only>
            </div>
            <div>
                <a v-for="item in socialMedia" :key="item.name" class="mr-2 cursor-pointer" @click="share(item.name)">
                    <span class="sr-only">{{ "Compartilhar no " + item.name }}</span>
                    <Icon :name="item.icon" />
                </a>
            </div>
        </div>
</template>


<script setup lang="ts">
const entrySelected = ref(false);

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
        name: 'Link',
        icon: 'ph:link',
    }
]


const share = (name: String) => {

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

if (process.client) {
    if (localStorage.getItem('selectedEntries') !== null) {
        const selectedEntries = JSON.parse(localStorage.getItem('selectedEntries')!)
        if (selectedEntries.includes(props.entryId)) {
            entrySelected.value = true;
        }
    }
}

const saveSelection = (id: number) => {
   
    event.preventDefault();

    if (localStorage.getItem('selectedEntries') === null) {
        localStorage.setItem('selectedEntries', JSON.stringify([id]))
        entrySelected.value = true;
    } else {
        const selectedEntries = JSON.parse(localStorage.getItem('selectedEntries')!)
        if (selectedEntries.includes(id)) {
            const index = selectedEntries.indexOf(id)
            selectedEntries.splice(index, 1)
            localStorage.setItem('selectedEntries', JSON.stringify(selectedEntries))
            entrySelected.value = false;
        } else {
            selectedEntries.push(id)
            localStorage.setItem('selectedEntries', JSON.stringify(selectedEntries))
            entrySelected.value = true;
        }
    }
}




</script>
