<template>
    <div class="flex flex-col items-end justify-center my-5">
        <nav aria-label="Paginação">
            <ul class="inline-flex items-center -space-x-px">
                <li>
                    <a v-if="currentPage != 1" class="block px-3 py-2 ml-0 leading-tight" @click="previousPage">
                        <span class="sr-only">Página anterior</span>
                        <Icon name="bi:chevron-left" class="w-5 h-5" />
                    </a>
                </li>

                <li v-for="page in pages" :key="page">
                    <template v-if="page === '...'">
                        <span class="block px-3 py-2 leading-tight">{{ page }}</span>
                    </template>
                    <template v-else>
                        <a href="#" class="block px-3 py-2 leading-tight"
                            :class="{ 'bg-red-900 text-white': page === currentPage }" @click="goToPage(page)">
                            {{ page }}
                        </a>
                    </template>
                </li>

                <li>
                    <a v-if="currentPage != totalPages" class="block px-3 py-2 leading-tight" @click="nextPage">
                        <span class="sr-only">Próxima página</span>
                        <Icon name="bi:chevron-right" class="w-5 h-5" />
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>
  
<script setup lang="ts">

const props = defineProps({
    currentPage: {
        type: Number,
        default: 1
    },
    totalPages: {
        type: Number,
        default: 1
    }
})

const emit = defineEmits(['update:currentPage', 'update:totalPages'])

const maxPages = 5

const pages = computed(() => {
    const pages = []

    pages.push(1)

    const startPage = Math.max(2, props.currentPage - 1)
    const endPage = Math.min(props.totalPages - 1, props.currentPage + maxPages - 3)

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    if (props.totalPages - pages[pages.length - 1] > 1) {
        pages.push('...')
    }

    if (props.totalPages > 1) {
        pages.push(props.totalPages)
    }

    return pages
})

const previousPage = () => {
    if (props.currentPage > 1) {
        goToPage(props.currentPage - 1)
    }
}

const nextPage = () => {
    if (props.currentPage < props.totalPages) {
        goToPage(props.currentPage + 1)
    }
}

const goToPage = (page: Number) => {
    emit('update:currentPage', page)
}
</script>