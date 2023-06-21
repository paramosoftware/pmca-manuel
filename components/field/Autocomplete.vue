<template>
    <div class="mt-4">
        <div class="w-full relative">
            <UILabel :for="id">
                {{ label }}
            </UILabel>

            <div class="flex flex-wrap mb-2" v-if="computedModelValue.length > 0">
                <div v-for="item in computedModelValue" :key="item.id"
                    class="flex justify-between items-center px-2 border border-pmca-accent p-1 my-1 mr-2 rounded-sm">

                    <div>{{ item.name }}</div>

                    <button @click="removeItem(item.id)" class="ml-2">
                        <Icon name="ph:trash-simple" class="w-6 h-6" title="Remover" />
                    </button>

                </div>
            </div>
            <span v-if="multiple || (!multiple && computedModelValue.length < max)">

                <div class="relative block text-gray-400 focus-within:text-pmca-accent">
                    <Icon name="ph:magnifying-glass"
                        class="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 right-3" />
                    <input type="text" id="search" v-model="searchTerm" :placeholder="placeholder"
                        class="w-full bg-gray-50 border border-gray-200 p-2 focus:outline-none focus:border-pmca-accent rounded-sm leading-none"
                        @input="searchItems">
                </div>

            </span>

            <ul @click.away="results = []" @keydown.escape="results = []" v-if="searchTerm !== ''"
                class="w-full bg-white border border-x-gray-300 border-b-gray-300 px-4 space-y-1 absolute z-10">

                <li v-for="item in results" :key="item.name" @click="selectItem(item.id, item.name)"
                    class="cursor-pointer hover:bg-gray-100  p-1">
                    {{ item.name }}
                </li>

                <li v-if="show && !results.length" class="text-gray-400 py-2" @click="searchTerm = ''">
                    Nenhum resultado encontrado.
                </li>

                <li v-if="allowCreate && !results.length && searchTerm !== ''" class="text-gray-600 py-2">
                    <button type="button" @click="createItem(searchTerm)">
                        Cadastrar: {{ searchTerm }}

                        <Icon name="ph:plus-circle" class="text-pmca-accent w-6 h-6" title="Criar" />

                    </button>
                </li>

            </ul>

        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    route: {
        type: String,
        required: true
    },
    label: String,
    modelValue: {
        type: Object as PropType<{ id: number, name: string }>,
        required: true
    },
    placeholder: String,
    allowCreate: {
        type: Boolean,
        default: false
    },
    multiple: {
        type: Boolean,
        default: true
    },
    max: {
        type: Number,
        default: 1
    },
    createFunction: {
        type: Function as PropType<Function>,
        required: false
    },
    searchFunction: {
        type: Function as PropType<Function>,
        required: false
    }
})

let searchTerm = ref('')
let results = ref([])
let timeoutId: NodeJS.Timeout = setTimeout(() => { }, 0);
let searching = ref(false);
let show = ref(false);

const emit = defineEmits(["update"]);

const computedModelValue = computed(() => {
    if (Array.isArray(props.modelValue)) {
        return props.modelValue;

    } else if (typeof props.modelValue === "object" && props.modelValue !== null) {
        if (props.modelValue.id == 0) {
            return [];
        }
        return [props.modelValue];
    }

    return [];
});

const selectItem = (id: number, item: string) => {
    if (computedModelValue.value.find((element) => element.id === id)) {
        searchTerm.value = "";
        return;
    }

    emit("update", props.id, 'add', { id, name: item });
    searchTerm.value = "";
};

const removeItem = (id: number) => {
    emit("update", props.id, 'remove', { id, name: "" });
};

const searchItems = async () => {
    if (searchTerm.value === '') {
        results.value = []
        return
    }

    clearTimeout(timeoutId);

    timeoutId = setTimeout(async () => {

        if (props.searchFunction) {
            const data = await props.searchFunction(searchTerm.value)
            results.value = data
            return
        }

        const { data } = await useFetchWithBaseUrl('api/' + props.route + '/autocomplete', {
            params: {
                q: searchTerm.value
            }
        })

        results.value = data.value
        results.value = results.value.slice(0, 10)

    }, 300);

    if (results.value.length === 0 && !searching.value) {
        show.value = true

        setTimeout(() => {
            show.value = false
        }, 3000);
    }

}

const createItem = async (value: string) => {
    if (!props.allowCreate) {
        return
    }

    if (props.createFunction) {
        const result = await props.createFunction(value)
        selectItem(result.id, result.name)
        return
    }


    const { data } = await useFetchWithBaseUrl('api/' + props.route, {
        method: 'POST',
        body: {
            name: value.trim()
        }
    })

    const result = data.value


    if (result) {
        selectItem(result.id, result.name)
    }
}

</script>
