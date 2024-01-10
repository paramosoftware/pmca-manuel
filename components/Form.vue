<template>
    <div class="flex flex-col justify-center items-center">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral">
            <form @submit.prevent="submit()">

                <div class="text-end flex justify-between" :class="{ 'mt-5 mb-2': !isAuxiliary }">
                    <UIAnchorReturn v-if="!isAuxiliary" :href=urlList />

                    <template v-if="!isCreate && !isAuxiliary">
                        <UIButton class="justify-items-start content-start items-start" @click="goToCreateForm">
                            <template v-if="genderNoun === 'f'">
                                Nova
                            </template>
                            <template v-else>
                                Novo
                            </template>
                        </UIButton>
                    </template>
                </div>

                <div class="justify-between flex flex-row items-center mt-2">

                    <UITitle>{{ isAuxiliary ? 'Adicionar' : (isCreate ? 'Criar' : 'Editar') }} {{ uncapitalize(label) }}</UITitle>
                    <UIButton v-if="!isAuxiliary" :type='"submit"'>Salvar</UIButton>

                </div>

                <template v-for="field in fields" :key="field.id">
                    <template v-if="components.has(field.name)">
                        <component :is="components.get(field.name)" :id="field.name" :formStore="formStore" />
                    </template>
                </template>

                <div class="mt-5 text-end">
                    <UIButton :type='"submit"'>{{ (isAuxiliary ? 'Adicionar' : 'Salvar') }}</UIButton>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ROUTES } from '~/config';

const props = defineProps({
    formStore: {
        type: Object as PropType<FormStore>,
        required: true
    },
});

const { model, label, genderNoun, labelSlug } = storeToRefs(props.formStore);

const urlList = ROUTES.list + model.value;
const urlCreate = ROUTES.create  + model.value;
const isCreate = !props.formStore.getId();
const isAuxiliary = props.formStore.getIsAuxiliary();
const router = useRouter();

async function submit() {

    const id = await props.formStore.save();

    if (id && !isAuxiliary) {

        router.push(ROUTES.edit + labelSlug.value + '/' + id);

        if (process.client) {
            // TODO: Full reload instead?
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        await props.formStore.load(model.value, id);
    }
}


function goToCreateForm() {
    if (process.client) {
        window.location.href = urlCreate;
    }
}


const fields = props.formStore.getFieldsConfig();
const components = new Map<string, any>();

for (const [key, field] of Object.entries(fields)) {
    const componentField = 'Field' + capitalize(field.uiField);

    if (vueComponentExists(componentField) && resolveComponent(componentField)) {
        components.set(field.name, resolveComponent(componentField));
    } else {
        console.error('Component ' + componentField + ' not found');
    }
}
</script>