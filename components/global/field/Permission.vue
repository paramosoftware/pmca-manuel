<template>
    <div class="mt-4">
        <UILabel> Permissões </UILabel>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-200 border border-b my-3">
                <tr class="bg-gray-100">
                    <th
                        v-for="thead in theads"
                        :key="thead"
                        class="text-center my-3"
                    >
                        {{ thead }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="permission in formPermissions"
                    :key="permission.resourceId"
                >
                    <td class="text-center border w-14">
                        {{ permission.label }}
                    </td>
                    <td
                        class="border flex-row w-14"
                        v-for="p in permissions"
                    >
                        <FieldCheckbox
                            v-model="permission[p]"
                            :id="permission.resourceId + '-' + p"
                            :class="'justify-evenly'"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    formStore: {
        type: Object as PropType<FormStore>,
        required: true
    }
});

const { data, pending, error } = await useFetchWithBaseUrl('/api/resource', {
    method: 'GET',
    params: {
        where: {
            isAppModel: false,
            isRelation: false
        }
    }
});

const currentPermissions =
    (props.formStore.getFieldData('permissions') as any[]) ?? [];

const permissions = ['read', 'create', 'update', 'delete', 'import', 'batch'];
const theads = [
    'Recurso',
    'Ler',
    'Criar',
    'Editar',
    'Excluir',
    'Importar',
    'Ações em lote'
];

const resources = (data.value.items as Resource[]) ?? [];

const formPermissions = reactive([] as any[]);

for (const resource of resources) {
    const found = currentPermissions.find(
        (p: any) => p.resourceId === resource.id
    );

    const permission = {
        id: found?.id,
        resourceId: resource.id,
        label: resource.labelPlural,
        read: found?.read ?? false,
        create: found?.create ?? false,
        update: found?.update ?? false,
        delete: found?.delete ?? false,
        import: found?.import ?? false,
        batch: found?.batch ?? false,
        _action_: 'update'
    };
    formPermissions.push(permission);
}

watch(
    formPermissions,
    (newVal) => {
        props.formStore.setFieldData('permissions', newVal);
    },
    { deep: true }
);
</script>
