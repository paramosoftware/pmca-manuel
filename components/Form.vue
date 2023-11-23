<template>
    <div class="flex flex-col justify-center items-center">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral">
            <form @submit.prevent="save">
        
                <div class="text-end flex justify-between" :class="{ 'mt-5 mb-10' : isStandalone }">
                    <UIAnchorReturn v-if="isStandalone"  :href=urlList />

                    <NuxtLink :to=urlCreate  v-if="showNewButton && !isCreate">
                        <UIButton class="justify-items-start content-start items-start">{{ genderNoun == 'm' ? 'Novo' : 'Nova' }}</UIButton>
                    </NuxtLink>
                </div>

                <div class="justify-between flex flex-row items-center mt-4">

                    <UITitle>{{ isStandalone ? (isCreate ? 'Criar' : 'Editar') : 'Adicionar' }} {{ label }}</UITitle>
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
import { ROUTES } from '~/config';

const props = defineProps({
    genderNoun: {
        type: String,
        required: true,
        validator: (value: string) => {
            return ['m', 'f'].includes(value);
        }  
    },
    objectName: {
        type: String,
        required: true  
    },
    objectNamePlural: {
        type: String,
        required: true  
    },
    label: {
        type: String,
        required: true  
    },
    labelPlural: {
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
const toast = useToast()

const urlList = ROUTES.list + props.urlPath;
const urlCreate = ROUTES.create  + props.urlPath;
const urlEdit = ROUTES.edit + props.urlPath;

const save = async () => {

    if (props.isStandalone) {

        let url = '/api/' + props.objectNamePlural + '/' + props.object.id;
        let method = 'PUT';

        if (props.object.id === 0) {
            url = '/api/' + props.objectName;
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
            router.push(urlEdit + '/' + saved.value.id);

            emit('changeUserFormState');

            toast.add({ 
                title: 'Dados salvos com sucesso.',
                ui: { rounded: 'rounded-sm', padding: 'p-5' }
            })

            if (process.client) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }

            return;
        }
    } else {
        emit('formSubmitted', props.object);
    }

};

</script>