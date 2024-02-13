<template>


<div class="mt-4">
    <UILabel>
        Permissões
    </UILabel>
</div>


<table class="w-full">
    <thead class="bg-gray-200 border border-b">
        <tr class="bg-gray-100 border border-b">
            <th>Recurso</th>
            <th class="text-left">Ler</th>
            <th class="text-left">Criar</th>
            <th class="text-left">Editar</th>
            <th class="text-left">Excluir</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="permission in formPermissions" :key="permission.resourceId">
            <td class="text-center border-b">{{ permission.label }}</td>
            <td class="text-center border-b" v-for="p in permissions">
                <FieldCheckbox v-model="permission[p]" :id="permission.resourceId + '-' + p" />
            </td>
        </tr>
    </tbody>
</table>

</template>

<script setup lang="ts">
const props = defineProps({
    formStore: {
        type: Object as PropType<FormStore>,
        required: true
    }
});


const { data, pending, error } = await useFetchWithBaseUrl('/api/appResource', {
    method: 'GET',
    params: {
        where: {
            isAppModel: false,
            isRelation: false
        }
    }
});

const currentPermissions = props.formStore.getFieldData('permissions') as any[] ?? [];

const permissions = ['read', 'create', 'update', 'delete'];

const resources = data.value.items as AppResource[] ?? [];

const formPermissions = reactive([] as any[]);

for (const resource of resources) {
    const found = currentPermissions.find((p: any) => p.resourceId === resource.id);

    const permission = {
        id: found?.id,
        resourceId: resource.id,
        label: resource.labelPlural,
        read: found?.read ?? false,
        create: found?.create ?? false,
        update: found?.update ?? false,
        delete: found?.delete ?? false,
        _action_: 'update'
    };
    formPermissions.push(permission);
}

watch(formPermissions, (newVal) => {
    props.formStore.setFieldData('permissions', newVal);
}, { deep: true });

</script>