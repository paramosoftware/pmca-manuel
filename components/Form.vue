<template>
    <div class="flex flex-col justify-center items-center mt-10">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral">
            <AnchorReturn v-if="isStandalone"  :href="'/logged/' + urlPath" />
            <div class="justify-between flex flex-row items-center mt-4">

                <h1 class="text-3xl text-black">{{ isCreate ? 'Criar' : 'Editar' }} {{ singularNamePt }}</h1>

                <NuxtLink :to="'/logged/' + urlPath + '/criar'">
                    <Button>{{ genderNoun == 'm' ? 'NOVO' : 'NOVA' }}</Button>
                </NuxtLink>

            </div>

            <slot />

            <div class="mt-5 text-end">
                <Button label="SALVAR" :on-click="save" />
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
const props = defineProps({
    genderNoun: {
        type: String,
    },
    singularName: {
        type: String,
        default: 'object'
    },
    pluralName: {
        type: String,
        default: 'objects'
    },
    singularNamePt: {
        type: String,
        default: 'objeto'
    },
    pluralNamePt: {
        type: String,
        default: 'objetos'
    },
    urlPath: {
        type: String,
        required: true  
    },
    isCreate: {
        type: Boolean,
        default: true
    },
    isStandalone: {
        type: Boolean,
        default: true
    },
    object: {
        type: Object,
        default: {
            value: {
                id: 0
            }
        }
    }
});

const router = useRouter();
const emit = defineEmits(['auxiliarySaved']);

const save = async () => {

    let url = '/api/' + props.pluralName + '/' + props.object.id;
    let method = 'PUT';

    if (props.object.id === 0) {
        url = '/api/' + props.pluralName;
        method = 'POST';
    }

    const { data: saved } = await useFetchWithBaseUrl(url, {
        // @ts-ignore
        method: method,
        body: JSON.stringify(props.object),
    });

    if (saved) {
        if (props.isStandalone) {
            router.push('/logged/' + props.urlPath + '/editar/' + saved.value.id);
        } else {
            emit('auxiliarySaved', saved.value);
        }
    }
};

</script>