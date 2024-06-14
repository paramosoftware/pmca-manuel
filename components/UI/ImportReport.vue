<template>
    <div 
        class="p-4 border mb-2 max-h-96 overflow-y-auto"
        :class="hasError ? 'border-red-700' : 'border-gray-300'"
    >
        <h2 class="text-xl font-bold">Relatório da importação</h2>
        <div class="mt-4">
            <div
                class="flex justify-between"
                v-for="point in points"
                :key="point.title"
            >
                <span class="text-gray-500">{{ point.title }}:</span>
                <span class="text-gray-800">{{ point.value }}</span>
            </div>
        </div>
        <div class="mt-4" v-if="report.errors.length > 0">
            <h3 class="text-lg font-bold">Erros</h3>
            <ul class="list-disc list-inside pl-3">
                <li v-for="error in report.errors" :key="error">
                    {{ error }}
                </li>
            </ul>
        </div>
        <div class="mt-4" v-if="report.warnings.length > 0">
            <h3 class="text-lg font-bold">Avisos</h3>
            <ul class="list-disc list-inside pl-3">
                <li v-for="warning in report.warnings" :key="warning">
                    {{ warning }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    report: {
        type: Object as PropType<ImportReport>,
        required: true
    },
    hasError: {
        type: Boolean,
        default: false
    }
});

const points = [
    {
        title: 'Total de itens',
        value: props.report.totalItems
    },
    {
        title: 'Itens processados',
        value: props.report.processedItems
    },
    {
        title: 'Duração',
        value: props.report.duration
    },
    {
        title: 'Itens pulados',
        value: props.report.skippedItems
    },
    {
        title: 'Avisos',
        value: props.report.warnings.length
    },
    {
        title: 'Erros',
        value: props.report.errors.length
    }
];
</script>
