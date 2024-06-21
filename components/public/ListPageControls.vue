<template>
    <div
        class="mt-4 md:flex md:flex-row justify-between md:items-center mr-2"
    >
        <div class="text-md" v-if="showTotal">
            {{ total }}
            {{ total > 1 ? 'itens' : 'item' }} encontrado{{
                total > 1 ? 's' : ''
            }}
        </div>
        <div class="text-md" v-else-if="total === 0 && search !== '' && !top">
            Nenhum item encontrado
            <span v-if="search !== ''"
                >para "<i>{{ search.substring(0, 20) }}</i
                >"</span
            >
        </div>
        <div v-else></div>
        <div class="flex justify-evenly space-x-2 my-5 overflow-x-auto">
            <UIIcon
                class="w-8 h-8 mr-3"
                :name="
                    sort === 'asc' ? 'ph:sort-ascending' : 'ph:sort-descending'
                "
                title="Ordenar por nome"
                @click="conceptStore.sortByName()"
                v-if="showOrder"
            />
            <UPagination
                v-model="page"
                :total="total"
                :page-count="pageSize"
                show-last
                show-first
                size="sm"
                :max="5"
                v-if="total > pageSize"
            />
            <FieldSelect
                v-if="total > pageSize"
                v-model="pageSize"
                :options="pageSizes"
                id="pageSize"
                size="sm"
                :add-margin="false"
                :required="true"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    top: {
        type: Boolean,
        default: true
    }
});

const conceptStore = useConceptStore();
const { page, total, sort, search, pageSize, pageSizes } = storeToRefs(conceptStore);

const showTotal = computed(() => total.value > 0 && props.top);
const showOrder = computed(() => total.value > 1 && props.top);
</script>

<style scoped>
::-webkit-scrollbar {
    height: 5px;
}
</style>