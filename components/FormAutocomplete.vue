<template>
    <div class="mt-4">
        <div class="w-full relative">
            <label class="text-lg uppercase text-red-900" :for="id">
                {{ label }}
            </label>

            <div class="flex flex-wrap mb-2" v-if="modelValue.length > 0">
                <div v-for="item in modelValue" :key="item.id"
                    class="text-red-900 px-2 border-2 border-red-900 p-1 mt-2 mr-2">
                    {{ item.name }}
                    <button @click="removeItem(item.id)" class="bg-white text-red-900">
                        <Icon name="ph:trash-simple" class="text-black w-6 h-6" title="Remover" />
                    </button>
                </div>
            </div>

            <div class="relative block text-gray-400 focus-within:text-red-900">
                <Icon name="ph:magnifying-glass"
                    class="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 right-3" />
                <input type="text" id="search" v-model="searchTerm" :placeholder="placeholder"
                    class="w-full block text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent placeholder-gray-400"
                    @input="searchItems">
            </div>

            <ul @click.away="results = []" @keydown.escape="results = []" v-if="searchTerm !== ''"
                class="w-full bg-white border border-x-gray-300 border-b-gray-300 px-4 space-y-1 absolute z-10">

                <li v-for="item in results" :key="item.name" @click="selectItem(item.id, item.name)"
                    class="cursor-pointer hover:bg-gray-100  p-1">
                    {{ item.name }}
                </li>

                <li v-if="show && !results.length" class="text-gray-400 py-2" @click="searchTerm = ''">
                    Nenhum resultado encontrado.
                </li>

            </ul>

        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    id: String,
    label: String,
    modelValue: {
        type: Array as PropType<{ id: number, name: string }[]>,
        default: () => [],
        required: true
    },
    placeholder: String,
    searchFunction: {
        type: Function as PropType<Function>,
        required: true
    }
})

let searchTerm = ref('')
let results = ref([])
let timeoutId: NodeJS.Timeout = setTimeout(() => { }, 0);
let searching = ref(false);
let show = ref(false);

const searchItems = async () => {
    if (searchTerm.value === '') {
        results.value = []
        return
    }

    clearTimeout(timeoutId);

    timeoutId = setTimeout(async () => {
        searching.value = true
        results.value = await props.searchFunction(searchTerm.value)
        results.value = results.value.slice(0, 10)
        searching.value = false
    }, 500);

    if (results.value.length === 0 && !searching.value) {
        show.value  = true

        setTimeout(() => {
            show.value = false
        }, 3000);
    }

}

const selectItem = (id: number, item: string) => {

    if (props.modelValue.find((element) => element.id === id)) {
        searchTerm.value = ''
        return
    }

    props.modelValue.push({ id, name: item })

    searchTerm.value = ''
}

const removeItem = (id: number) => {
    props.modelValue.splice(props.modelValue.findIndex(item => item.id === id), 1);
}
</script>
