<template>
    <div class="mt-4">
        <div class="w-full relative">
            <label class="text-lg uppercase text-red-900" :for="id">
                {{ label }}
            </label>

            <button class="border-2 border-red-900 ml-2 bg-red-900" @click="isOpenModal = true">
                <Icon name="ph:plus" class="w-5 h-5 text-white" title="Adicionar" />
            </button>

            <div class="flex flex-wrap mb-2" v-if="items.length > 0">
                <div v-for="item in items" :key="item.id" class="text-gray-700 px-2 border-2 border-red-900 p-1 mt-2 mr-2">
                    {{ item.name }}
                    <button @click="removeItem(item.id)" class="bg-white text-red-900">
                        <Icon name="ph:trash-simple" class="text-black w-6 h-6" />
                    </button>
                </div>
            </div>

            <UModal id="modal-form" v-model="isOpenModal" :ui="{ width: 'max-w-lg', rounded: '' }">

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
    route: {
        type: String,
        required: true
    },
    objectId: {
        type: Number,
        required: true
    },
    items: {
        type: Array as PropType<{ id: number, name: string }[]>,
        required: true
    }
})

const isOpenModal = ref(false)

const removeItem = async (id: number) => {
    const { data } = await useFetchWithBaseUrl('/api/' + props.route + '/' + id, {
        method: 'DELETE',
    })

    if (data) {
        const index = props.items.findIndex(item => item.id === id)
        props.items.splice(index, 1)
    }
}

</script>