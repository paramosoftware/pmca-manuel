<template>
    <div class="mt-4">
        <div class="w-full relative">


            <UILabel :for="id">
                {{ label }}
            </UILabel>


            <button type="button" class="border ml-2 bg-pmca-accent hover:bg-pmca-primary p-1" @click="isOpenModal = true">
                <Icon name="ph:plus" class="w-5 h-5 text-white" title="Adicionar" />
            </button>

            <div class="flex flex-wrap mb-2" v-if="items && items.length">
                <div v-for="item in items" :key="item.id" class="px-2 border border-pmca-accent p-1 mt-2 mr-2">
                    {{ item.name }}
                    <button type="button" @click="removeItem(item.id)" class="bg-white">
                        <Icon name="ph:trash-simple" class="w-6 h-6" />
                    </button>
                </div>
            </div>

            <UModal id="modal-form" v-model="isOpenModal" :ui="{ width: 'max-w-lg', rounded: 'border-sm' }">
                <UICloseButton @click="isOpenModal = false" />

                <slot />

            </UModal>

        </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    items: {
        type: Array as PropType<{ id: number, name: string }[]> | undefined,
        required: true,
        default: () => []
    }
})

const isOpenModal = ref(false)

const emit = defineEmits(["update"]);

const removeItem = async (id: number) => {
    emit("update", props.id, 'remove', { id, name: "" });
};


defineExpose({
    isOpenModal
});

</script>