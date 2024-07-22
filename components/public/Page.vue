<template>
    <main
        class="w-full h-full shadow-lg border-b border-gray-200 rounded-md bg-white break-words"
        :class="{ border: addBorder }"
    >
        <div
            class="flex justify-end border-b border-gray-200 bg-gray-50"
            v-if="hasActions()"
        >
            <div class="flex flex-row items-center space-x-4 p-4">
                <h4 class="text-sm font-semibold text-app-primary">
                    <slot name="actions-title"></slot>
                </h4>
                <slot name="actions-icons"></slot>
            </div>
        </div>
        <div
            class="flex justify-end border-b border-gray-200 bg-gray-50 lg:hidden"
            v-if="hasSubActions()"
        >
            <div class="flex flex-row items-center space-x-4 p-4">
                <h4 class="text-sm font-semibold text-app-primary">
                    <slot name="actions-sub-title"></slot>
                </h4>
                <slot name="actions-sub-icons"></slot>
            </div>
        </div>

        <div class="py-5 px-3 md:px-5">
            <slot name="template-header" v-if="hasTemplateHeader()" />
            <span v-else>
                <GuideBreadcrumb v-if="isGuide && showBreadcrumb" />
                <PublicBreadcrumb
                    :add-concept-link="false"
                    v-if="showBreadcrumb && !isGuide"
                />
                <UIPageTitle class="pb-1 mb-4" v-if="title">
                    {{ title }}
                    <hr class="border-gray-200" v-if="addHorizontalLine" />
                </UIPageTitle>
            </span>

            <slot></slot>
        </div>
    </main>
</template>

<script setup lang="ts">
defineProps({
    title: {
        type: String,
        default: ''
    },
    hasTitle: {
        type: Boolean,
        default: true
    },
    showBreadcrumb: {
        type: Boolean,
        default: true
    },
    addBorder: {
        type: Boolean,
        default: true
    },
    addHorizontalLine: {
        type: Boolean,
        default: true
    },
    isGuide: {
        type: Boolean,
        default: false
    }
});

const slots = useSlots();

function hasActions() {
    return slots['actions-title'] || slots['actions-icons'];
}

function hasSubActions() {
    return slots['actions-sub-title'] || slots['actions-sub-icons'];
}

function hasTemplateHeader() {
    return slots['template-header'];
}
</script>
