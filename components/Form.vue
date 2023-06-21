<template>
    <div class="flex flex-col justify-center items-center">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral">
            <form @submit.prevent="save">
        
                <div class="text-end flex justify-between" :class="{ 'mt-5 mb-10' : isStandalone }">
                    <UIAnchorReturn v-if="isStandalone"  :href="'/logged/' + urlPath" />

                    <NuxtLink :to="'/logged/' + urlPath + '/criar'" v-if="showNewButton && !isCreate">
                        <UIButton class="justify-items-start content-start items-start">{{ genderNoun == 'm' ? 'Novo' : 'Nova' }}</UIButton>
                    </NuxtLink>
                </div>

                <div class="mt-2 text-center" v-show="backFromSaving">
                        <h1>Dados salvos com sucesso.</h1>
                </div>


                <div class="justify-between flex flex-row items-center mt-4">


                    <h1 class="text-2xl">{{ isStandalone ? (isCreate ? 'Criar' : 'Editar') : 'Adicionar' }} {{ singularNamePt }}</h1>

                    <UIButton v-if="isStandalone" :type='"submit"'>Salvar</UIButton>

                </div>


                <slot />

                <div class="mt-5 text-end">
                    <UIButton :type='"submit"'>{{ (isStandalone ? 'Salvar' : 'Adicionar') }}</UIButton>
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
const emit = defineEmits(['formSubmitted', 'error', 'changeUserFormState']);

const backFromSaving = ref(false);

const save = async () => {

    if (props.isStandalone) {

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
            return;
        }

        if (saved.value) {
            router.push('/logged/' + props.urlPath + '/editar/' + saved.value.id);

            backFromSaving.value = true;

            setTimeout(() => {
                backFromSaving.value = false;
            }, 8000);

            emit('changeUserFormState');

        }
    } else {
        emit('formSubmitted', props.object);
    }

};

</script>