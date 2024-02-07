<template>
    <UICardContainer :border="!isAuxiliary">
        <template #header>
            <UIAnchorReturn v-if="!isAuxiliary" :href=urlList />
            <div class="text-end flex justify-between" :class="{ 'mt-5 mb-2': !isAuxiliary }">
                <UIContainerTitle> {{ formTitle }} </UIContainerTitle>
                <template v-if="!isCreate && !isAuxiliary">
                    <UIIcon name="ph:plus-circle" @click="goToCreateForm" title="Criar novo" class="w-8 h-8 cursor-pointer" />
                </template>
            </div>
        </template>


        <form @submit.prevent="submit">
            <div class="text-end" v-if="visibleFields > 5 && !isAuxiliary ">
                <UIButton :type='"submit"' size="xl">Salvar</UIButton>
            </div>

            <template v-for="field in fields" :key="field.id">
                <template v-if="components.has(field.name)">
                    <component :is="components.get(field.name)" :id="field.name" :formStore="formStore" />
                </template>
            </template>

            <div v-if="model === 'AppUser'">
                <FieldCheckbox id="changePassword" v-model="changePassword" label="Alterar senha" v-if="!isCreate" />
                <template v-if="changePassword || isCreate">
                    <FieldInput id="password" v-model="password" type="password" :label="isCreate ? 'Senha' : 'Nova senha'" :required="isCreate" />
                </template>
            </div>

            <div class="mt-5 text-end">
                <UIButton :type='"submit"' size="xl">{{ buttonLabel }}</UIButton>
            </div>

        </form>

    </UICardContainer>
</template>

<script setup lang="ts">
import ROUTES from '~/config/routes';

const props = defineProps({
    formStore: {
        type: Object as PropType<FormStore>,
        required: true
    }
});
const router = useRouter();
const { model, label, genderNoun, labelSlug } = storeToRefs(props.formStore);

const changePassword = ref(false);
const password = ref('');
const urlList = ROUTES.list + labelSlug.value;
const urlCreate = ROUTES.create + labelSlug.value;
const isCreate = !props.formStore.getId();
const isAuxiliary = props.formStore.getIsAuxiliary();

const isAdd = computed(() => {
    return isAuxiliary && isCreate;
});


const formTitle = computed(() => {
    return (isAdd.value ? 'Adicionar' : (isCreate ? 'Criar' : 'Editar')) + ' ' + uncapitalize(label.value);
});

const buttonLabel = computed(() => {
    return isAdd.value ? 'Adicionar' : 'Salvar';
});

async function submit() {
    // TODO: hardcoded
    if (model.value === 'AppUser') {
        if (changePassword.value || isCreate) {
            props.formStore.setFieldData('restricted', { password: password.value });
        }
    }

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
const visibleFields = ref(0);

for (const [key, field] of Object.entries(fields)) {
    const componentField = 'Field' + capitalize(field.uiField);

    if (props.formStore.getIsAuxiliary()) {
        if (props.formStore.parentModel === field.relatedResource?.name) {
            continue;
        }
    }

    if (vueComponentExists(componentField) && resolveComponent(componentField)) {
        if (!field.hidden) {
            visibleFields.value++;
        }
        components.set(field.name, resolveComponent(componentField));
    } else {
        console.error('Component ' + componentField + ' not found');
    }
}

</script>