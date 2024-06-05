<template>
    <PublicNavigation :use-concept-store-for-tree="false">
        <article class="w-7xl">
            <PublicBreadcrumb :links="breadcrumb" />
            <PublicFullCardTitle :id="id" :name="concept!.name" class="mb-4" />
            <div class="flex flex-row">
                <div class="pr-2 w-full">
                    <UITab :tabs="['Termo', 'Histórico de alterações']">
                        <template #tabPanel-1>
                            <div class="flex flex-col lg:flex-row gap-5">
                                <div v-if="conceptValidator" class="w-full">
                                    <div
                                        class="flex justify-center mt-4 items-center w-full h-48"
                                    >
                                        <p
                                            class="text-gray-400 text-center"
                                        >
                                            Nenhuma informação cadastrada.
                                        </p>
                                    </div>
                                </div>
                                <div
                                    v-else
                                    class="flex flex-col min-h-48 w-full lg:w-8/12"
                                >
                                    <PublicFieldAttribute
                                        title="Definição"
                                        :content="concept?.definition"
                                        :is-html="true"
                                    />

                                    <PublicFieldAttribute
                                        title="Notas"
                                        :content="concept?.notes"
                                        :is-html="true"
                                    />

                                    <PublicFieldAttribute
                                        title="Formas variantes"
                                        :content="concept?.variations"
                                    />

                                    <PublicFieldAttribute
                                        title="Termos equivalentes em outros idiomas"
                                        :content="translations"
                                    />

                                    <PublicFieldAttribute
                                        title="Fontes"
                                        :content="concept?.references"
                                        :is-html="true"
                                        :is-one-line="true"
                                    />

                                    <PublicRelatedConcepts
                                        title="Ver também"
                                        :concepts="concept?.relatedConcepts"
                                        :opposite-side="concept?.concepts"
                                    />
                                </div>
                                <div
                                    class="w-full lg:w-4/12 order-first lg:order-last py-auto bg-gray-100 rounded-md"
                                    v-if="images.length > 0"
                                >
                                    <PublicMedia :images="images" />
                                </div>
                            </div>
                        </template>
                        <template #tabPanel-2>
                            <div class="flex flex-col">
                                <PublicHistoryChange />
                            </div>
                        </template>
                    </UITab>
                </div>
            </div>
        </article>
    </PublicNavigation>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

// TODO: Track access to concepts
// TODO: Get field labels from API
// TODO: Create a component

const router = useRouter();
const config = useRuntimeConfig();
const slug = ref(router.currentRoute.value.params.slug.toString());

const conceptStore = useConceptStore();
await conceptStore.load(slug.value);

const { concept, error, ancestors } = storeToRefs(conceptStore);

if (!error.value && !concept.value) {
    throw createError({
        data: {
            title: 'Termo não encontrado'
        }
    });
}

const checkIfConceptHasDefinitions = (concept: { value: any }) => {
    // TODO: Find a better way in the future to not hardcode the properties.
    // Current concept has 21 properties, and we check 9 (relevant ones for this case) but if the db structure changes, that must be updated btw
    const propertiesToBeChecked = [
        'definition',
        'notes',
        'references',
        'translations',
        'variations',
        'concepts',
        'relatedConcepts',
        'media',
        'children'
    ];
    if (concept.value) {
        let counter = propertiesToBeChecked.length;
        for (const key in concept.value) {
            if (!propertiesToBeChecked.includes(key)) {
                continue;
            }

            if (
                Array.isArray(concept.value[key]) &&
                !concept.value[key].length
            ) {
                counter--;
                continue;
            }

            if (concept.value[key] == null) {
                counter--;
            }
        }

        return counter == 0 ? true : false;
    }
};

const conceptValidator = checkIfConceptHasDefinitions(concept);

const id = ref(concept.value?.id ?? 0);
const title = ref(concept.value?.name);
const description = ref(
    concept.value?.definition
        ? concept.value.definition.replace(/<[^>]*>?/gm, '').substring(0, 150)
        : ''
);

const images = ref<string[]>([]);
const translations = ref<{ name: string; link: string }[]>([]);

if (concept.value?.media) {
    concept.value.media.forEach((media: ConceptMedia) => {
        images.value.push(media.name);
    });
}

if (concept.value?.translations) {
    concept.value?.translations.forEach((translation: Translation) => {
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

const breadcrumb = ref<Link[]>([]);

if (ancestors.value) {
    ancestors.value.forEach((ancestor: Concept) => {
        breadcrumb.value.push({
            label: ancestor.name,
            to: '/termos/' + ancestor.nameSlug,
            icon: 'i-ph-article'
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