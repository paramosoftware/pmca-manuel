<template>
    <div class="h-full">
       
        <ul>
            <li v-for="navigationParent in props.navigationObject" :key="navigationParent._path">
                
                <label class="text-primary-400">
                    {{ navigationParent.title }}
                </label>
                <PublicManualNavigationChildren :navigationObject="navigationParent.children"/>
            </li>
        </ul>
    </div>

</template>

<script setup lang="ts">

const props = defineProps({
    navigationObject: {
    type: Object as () => NavItem[] | null,
    required: true
  },
});
</script>
