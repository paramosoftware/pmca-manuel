<template>
    <div ref="glossarySeletorRef" class="relative">
        <p
            :class="`text-2xl text-app-primary font-semibold line-clamp-2 items-end ${props.customClass}`"
            :title="glossaryName"
            @click="isSelectorOpen = !isSelectorOpen"
        >
            {{ glossaryName }}
            <UIIcon
                :name="isSelectorOpen ? 'ph:caret-up' : 'ph:caret-down'"
                size="sm"
                v-if="availableGlossaries.length > 1"
            />
        </p>

        <ul
            v-if="isSelectorOpen && availableGlossaries.length > 1"
            class="absolute bg-white z-10 mt-1 rounded-md shadow-xl max-h-60 overflow-y-auto text-md border w-full"
        >
            <span v-for="glossary in availableGlossaries" :key="glossary.name">
                <li
                    @click="setGlossary(glossary.id)"
                    class="p-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200 text-app-secondary-500 hover:text-app-theme-500"
                    v-if="glossary.name !== glossaryName"
                >
                    {{ glossary.name }}
                </li>
            </span>
        </ul>
    </div>
</template>

<script setup lang="ts">
import ROUTES from '~/config/routes';

const props = defineProps({
    public: {
        type: Boolean,
        default: true
    },
    customClass: String
});

const glossarySeletorRef = ref<HTMLElement | null>(null);
const isSelectorOpen = ref(false);
const glossaryStore = useGlossaryStore();
await glossaryStore.fetch(props.public);
const { name: glossaryName, availableGlossaries } = storeToRefs(glossaryStore);

useOnClickOutside(glossarySeletorRef, () => {
    isSelectorOpen.value = false;
});

function setGlossary(glossaryId: number) {
    glossaryStore.setGlossary(glossaryId, props.public);
    isSelectorOpen.value = false;
    if (import.meta.client) {
        if (props.public) {
            window.location.reload();
        } else {
            window.location.href = ROUTES.restricted;
        }
    }
}
</script>
