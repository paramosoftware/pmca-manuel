<template>
    <div
        id="individualConceptContainer"
        class="flex flex-col flex-grow justify-center items-stretch min-h-full w-screen max-w-full rounded-md "
    >
        <div
            id="wrapper"
            class="max-w-full flex flex-col justify-center flex-grow"
        >
            <div
                id="wrapper2"
                class="flex justify-center max-w-full flex-row h-full flex-grow " 
            > <!-- container fits the proper size but div two is overflowing smh.... -->
                <div
                    id="one"
                    :style="{
                        'max-height': `${conceptContainerCurrentHeight / 16}rem`
                    }"
                    class="max-w-[15vw]"
                    v-if="!navigationStore.isSmallScreen"
                    
                >
                 <!-- i hardcoded both 15vw and 70vw for now but thats really not a good solution -->
                    <PublicHierarchicalNavigation class="overflow-x-hidden" />
                </div>
                <div id="two" class="flex flex-grow max-w-[70vw] ">
                    <article
                        class="flex flex-col p-4 md:p-8 flex-grow max-w-full bg-white rounded-tr-lg rounded-br-lg border-t border-l border-b border-r border-gray-200 transition-all duration-300"
                        ref="conceptContainer"
                    >
                        <PublicBreadcrumb
                            :links="breadcrumb"
                            class="overflow-x-auto max-w-full"
                        />
                        <PublicFullCardTitle
                            :id="id"
                            :name="concept!.name"
                            class="mb-4 max-w-full"
                        />

                        <div class="flex flex-row">
                            <div class="pr-2 w-full">
                                <UITab
                                    :tabs="['Termo', 'Histórico de alterações']"
                                >
                                    <template #tabPanel-1>
                                        <div
                                            class="flex flex-col lg:flex-row gap-5"
                                        >
                                            <div
                                                v-if="conceptValidator"
                                                class="w-full"
                                            >
                                                <div
                                                    class="flex justify-center mt-4 items-center w-full h-48"
                                                >
                                                    <p
                                                        class="text-gray-400 text-center"
                                                    >
                                                        Nenhuma informação
                                                        cadastrada.
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                v-else
                                                class="flex flex-col min-h-48 w-full lg:w-8/12 break-words"
                                            >
                                                <PublicFieldAttribute
                                                    title="Definição"
                                                    :content="
                                                        concept?.definition
                                                    "
                                                    :is-html="true"
                                                />

                                                <PublicFieldAttribute
                                                    title="Notas"
                                                    :content="concept?.notes"
                                                    :is-html="true"
                                                />

                                                <PublicFieldAttribute
                                                    title="Formas variantes"
                                                    :content="
                                                        concept?.variations
                                                    "
                                                />

                                                <PublicFieldAttribute
                                                    title="Termos equivalentes em outros idiomas"
                                                    :content="translations"
                                                />

                                                <PublicFieldAttribute
                                                    title="Fontes"
                                                    :content="
                                                        concept?.references
                                                    "
                                                    :is-html="true"
                                                    :is-one-line="true"
                                                   
                                                />

                                                <PublicRelatedConcepts
                                                    title="Ver também"
                                                    :concepts="
                                                        concept?.relatedConcepts
                                                    "
                                                    :opposite-side="
                                                        concept?.concepts
                                                    "
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
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

// TODO: Track access to concepts [Já implementado?]
// TODO: Get field labels from API [Já implementado?]
// TODO: Create a component [Já implementado?]

const router = useRouter();
const config = useRuntimeConfig();
const slug = ref(router.currentRoute.value.params.slug.toString());

const conceptStore = useConceptStore();
const navigationStore = useNavigationStore();
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
    // TODO: Find a better way in the future to not hardcode the properties. [PMCA-413]
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

const images = ref<ImgHtml[]>([]);
const translations = ref<{ name: string; link: string }[]>([]);

if (concept.value?.media) {
    concept.value.media.forEach((media: ConceptMedia) => {
        images.value.push({ src: media.name!, alt: media.subtitle ?? '' });
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
            images.value[0].src;
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

const conceptContainer: Ref<HTMLElement | null> = ref(null);
const conceptContainerCurrentHeight = ref(0);
let conceptContainerResizeObserver: ResizeObserver;

onMounted(() => {
    if (conceptContainer.value?.offsetHeight) {
        conceptContainerResizeObserver = new ResizeObserver(() => {
            if (conceptContainer.value) {
                conceptContainerCurrentHeight.value =
                    conceptContainer.value.offsetHeight;
            }
        });
        conceptContainerResizeObserver.observe(conceptContainer.value);
    }
});

onUnmounted(() => {
    if (conceptContainerResizeObserver && conceptContainer.value) {
        conceptContainerResizeObserver.unobserve(conceptContainer.value);
    }
});
</script>
