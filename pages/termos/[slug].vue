<template>
    <article>
        <div class="sm:flex sm:justify-between sm:items-center">
            <UIPageTitle class="flex items-center">
                {{ entry?.name }}
                <client-only>
                    <UIIcon
                        class="text-pmca-accent cursor-pointer ml-2"
                        :name="
                            entrySelected
                                ? 'ph:bookmark-simple-fill'
                                : 'ph:bookmark-simple'
                        "
                        @click="entrySelected = toggle($event, id)"
                        :title="entrySelected ? 'Remover' : 'Adicionar'"
                    />
                </client-only>
            </UIPageTitle>
            <PublicEntryActions :entryId="entry!.id" :title="entry!.name" />
        </div>

        <UITab
            :tabs="['Termo', 'Classificação', 'Histórico de alterações']"
            @change="onTabChange"
        >
            <template #tabPanel-1>
                <div class="flex flex-col min-h-48">
                    <PublicEntryMedia
                        :images="images"
                        v-if="images.length > 0"
                    />

                    <PublicEntryAttribute
                        title="Definição"
                        :content="entry?.definition"
                        :is-html="true"
                    />

                    <PublicEntryAttribute
                        title="Notas"
                        :content="entry?.notes"
                        :is-html="true"
                    />

                    <PublicEntryAttribute
                        title="Formas variantes"
                        :content="entry?.variations"
                    />

                    <PublicEntryAttribute
                        title="Termos equivalentes em outros idiomas"
                        :content="translations"
                    />

                    <PublicEntryAttribute
                        title="Fontes"
                        :content="entry?.references"
                        :is-html="true"
                        :is-one-line="true"
                    />

                    <PublicEntryRelatedEntries
                        title="Ver também"
                        :entries="entry?.relatedEntries"
                        :opposite-side="entry?.entries"
                    />
                </div>
            </template>
            <template #tabPanel-2>
                <div class="flex flex-col">
                    <UITreeView
                        :tree="entriesTree"
                        class="p-3 overflow-y-auto text-pmca-primary"
                    />
                </div>
            </template>
            <template #tabPanel-3>
                <div class="flex flex-col">
                    <PublicEntryChanges />
                </div>
            </template>
        </UITab>
    </article>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

// TODO: Track access to entries
// TODO: Get field labels from API

const router = useRouter();
const config = useRuntimeConfig();
const slug = ref(router.currentRoute.value.params.slug.toString());

const { isSelected, toggle } = useEntrySelection();
const entryStore = useEntryStore();
await entryStore.load(slug.value);

const { entry, pending, sort, error, entriesTree } = storeToRefs(entryStore);

if (!error.value && !entry.value) {
    throw createError({
        data: {
            title: 'Termo não encontrado'
        }
    });
}

const id = ref(entry.value?.id ?? 0);
const title = ref(entry.value?.name);
const description = ref(
    entry.value?.definition
        ? entry.value.definition.replace(/<[^>]*>?/gm, '').substring(0, 150)
        : ''
);
const entrySelected = ref(isSelected(id.value));

const images = ref<string[]>([]);
const translations = ref<{ name: string; link: string }[]>([]);

if (entry.value?.media) {
    entry.value.media.forEach((media: EntryMedia) => {
        images.value.push(media.name);
    });
}

if (entry.value?.translations) {
    entry.value?.translations.forEach((translation: Translation) => {
        translations.value.push({
            name:
                translation.name +
                ' (' +
                (translation.language?.code ?? translation.language?.name) +
                ')',
            link: ''
        });
    });
}

const url = ref('');

if (images.value.length > 0) {
    if (process.client) {
        url.value =
            window.location.protocol +
            '//' +
            window.location.host +
            '/media/' +
            images.value[0];
    }
}

const onTabChange = async (value: number) => {
    if (value === 2 && entriesTree.value.length === 0) {
        await entryStore.fetchEntriesTree();
    }
};

onBeforeMount(() => {
    entrySelected.value = isSelected(id.value);
});

useHead({
    title: title.value + ' | ' + config.public.appName,
    meta: [
        { hid: 'description', name: 'description', content: description.value },
        { hid: 'og:title', property: 'og:title', content: title.value },
        {
            hid: 'og:description',
            property: 'og:description',
            content: description.value
        },
        { hid: 'og:image', property: 'og:image', content: url.value }
    ]
});
</script>
