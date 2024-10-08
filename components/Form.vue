<template>
    <UICardContainer :border="!isAuxiliary">
        <template #header>
            <UIAnchorReturn v-if="!isAuxiliary" :href="urlList" />
            <div
                class="text-end flex justify-between"
                :class="{ 'mt-5 mb-2': !isAuxiliary }"
            >
                <UIContainerTitle :size="isAuxiliary ? '2xl' : '3xl'">
                    {{ formTitle }} 
                </UIContainerTitle>
                <template v-if="!isCreate && !isAuxiliary && canCreate">
                    <UIIcon
                        name="ph:plus-circle"
                        @click="goToCreateForm"
                        title="Criar"
                    />
                </template>
            </div>
        </template>

        <form @submit.prevent="submit">
            <div class="text-end" v-if="visibleFields > 5 && !isAuxiliary">
                <UIButton :type="'submit'" size="lg">Salvar</UIButton>
            </div>

            <template v-for="field in fields" :key="field.id">
                <template v-if="components.has(field.name)">
                    <component
                        :is="components.get(field.name)"
                        :id="field.name"
                        :formStore="formStore"
                    />
                </template>
            </template>

            <div class="mt-5 text-end">
                <UIButton :type="'submit'" size="lg">{{
                    buttonLabel
                }}</UIButton>
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
const { model, label, genderNoun, labelSlug, canCreate } = storeToRefs(
    props.formStore
);

const originalFormFieldsJson = ref('');
const isCreationForm = ref(useRoute().fullPath.includes('criar'));
const isFormSaved = ref(true);
const isFieldChanged = ref(false);
const fieldsData = reactive(props.formStore.getFieldsData());

const fieldsDataStringified = computed(() => {
    return JSON.stringify(fieldsData);
});

const fieldsDataWatcher = watch(fieldsDataStringified, (newValue, oldValue) => {
    if (newValue == originalFormFieldsJson.value) {
        isFieldChanged.value = false;
    }
    
    if (newValue != originalFormFieldsJson.value) {
        isFieldChanged.value = true;

        if (isFormSaved.value) {
            if (isCreationForm.value && newValue == `{"published":"true"}`) {
                return;
            }
            isFormSaved.value = false;
        }
        return;
    }

    isFieldChanged.value = false;

    return;
});

const showExitConfirmation = (
    event?: BeforeUnloadEvent,
    // @ts-ignore
    next?: NavigationGuardNext
) => {
    if (next) {
        const answer = window.confirm(
            'Existem alterações não salvas. Realmente deseja sair?'
        );

        if (answer) {
            next();
        } else {
            next(false);
        }
        return;
    }

    if (event) {
        event.preventDefault();
        return;
    }
};

const shouldPopupAppear = computed(() => {
    const condition = isFieldChanged.value && !isFormSaved.value;
    return condition;
});

const confirmSave = () => {
    isFormSaved.value = true;
    isFieldChanged.value = false;
    originalFormFieldsJson.value = getCurrentFormFieldsJson();
};

const getCurrentFormFieldsJson = () => {
    return JSON.stringify(props.formStore.getFieldsData());
};

onBeforeMount(() => {
    originalFormFieldsJson.value = getCurrentFormFieldsJson();
});

onMounted(() => {
    window.addEventListener(`beforeunload`, (event) => {
        if (shouldPopupAppear.value) {
            showExitConfirmation(event);
            return;
        }

        return;
    });
});

onBeforeRouteLeave((to, from, next) => {
    if (shouldPopupAppear.value) {
        showExitConfirmation(undefined, next);
    } else {
        next();
    }
});

onBeforeUnmount(() => {
    fieldsDataWatcher();
    isFieldChanged.value = false;
});

const urlList = ROUTES.list + labelSlug.value;
const urlCreate = ROUTES.create + labelSlug.value;
const isCreate = computed(() => {
    return !props.formStore.getId();
});
const isAuxiliary = computed(() => {
    return props.formStore.getIsAuxiliary();
});

const isAdd = computed(() => {
    return isAuxiliary.value && isCreate.value;
});

const formTitle = computed(() => {
    return (
        (isAdd.value ? 'Adicionar' : isCreate.value ? 'Criar' : 'Editar') +
        ' ' +
        uncapitalize(label.value)
    );
});

const buttonLabel = computed(() => {
    return isAdd.value ? 'Adicionar' : 'Salvar';
});

async function submit() {
    const id = await props.formStore.save();

    if (id && !isAuxiliary.value) {
        confirmSave();

        if (import.meta.client) {
           window.location.href = ROUTES.edit + labelSlug.value + '/' + id
        }
    }
}

function goToCreateForm() {
    if (import.meta.client) {
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

    if (
        vueComponentExists(componentField) &&
        resolveComponent(componentField)
    ) {
        if (!field.hidden) {
            visibleFields.value++;
        }
        components.set(field.name, resolveComponent(componentField));
    } else {
        console.error('Component ' + componentField + ' not found');
    }
}
</script>
