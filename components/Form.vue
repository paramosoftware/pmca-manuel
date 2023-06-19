<template>
    <ExternalNavbar />
    
    <div class="flex flex-col justify-center items-center mt-10">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral">
            <form @submit.prevent="save">
                <AnchorReturn v-if="isStandalone"  :href="'/logged/' + urlPath" />

                <div class="justify-between flex flex-row items-center mt-4">

                    <h1 class="text-3xl text-black">{{ isCreate ? 'Criar' : 'Editar' }} {{ singularNamePt }}</h1>

                    <NuxtLink :to="'/logged/' + urlPath + '/criar'" v-if="showNewButton && !isCreate">
                        <Button>{{ genderNoun == 'm' ? 'NOVO' : 'NOVA' }}</Button>
                    </NuxtLink>

                </div>

                <div class="mt-2 text-center" v-show="backFromSaving">
                    <h1>Dados salvos com sucesso.</h1>
                </div>

                <slot />

                <div class="mt-5 text-end">
                    <Button :type='"submit"'>SALVAR</Button>
                </div>

            </form>
        </div>
    </div>

</template>


<script setup lang="ts">

const props = defineProps({
    genderNoun: {
        type: String,
        required: true,
        validator: (value: string) => {
            return ['m', 'f'].includes(value);
        }  
    },
    singularName: {
        type: String,
        required: true  
    },
    pluralName: {
        type: String,
        required: true  
    },
    singularNamePt: {
        type: String,
        required: true  
    },
    pluralNamePt: {
        type: String,
        required: true  
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
    },
    showNewButton: {
        type: Boolean,
        default: true
    },
});

const router = useRouter();
const emit = defineEmits(['auxiliarySaved', 'error', 'changeUserFormState']);

const backFromSaving = ref(false);

const save = async () => {

    let url = '/api/' + props.pluralName + '/' + props.object.id;
    let method = 'PUT';

    if (props.object.id === 0) {
        url = '/api/' + props.pluralName;
        method = 'POST';
    }

    const { data: saved, error } = await useFetchWithBaseUrl(url, {
        // @ts-ignore
        method: method,
        body: JSON.stringify(props.object),
    });


    if (error.value) {
        emit('error', error.value.data);
    }

    if (saved.value) {
        if (props.isStandalone) {
            router.push('/logged/' + props.urlPath + '/editar/' + saved.value.id);

            backFromSaving.value = true;
            setTimeout(() => {
                backFromSaving.value = false;
            }, 8000);
            emit('changeUserFormState');
        } else {
            emit('auxiliarySaved', saved.value);
        }
    }
};

</script>