<template>
    <nav class="bg-gray-300 w-1/3">
      <PublicManualNavigationRoot :navigation-object="navigation">
      </PublicManualNavigationRoot>
    
    </nav>
    <!-- <pre>
        {{ navigation }}
    </pre> -->
  </template>

<script setup lang="ts">

const props = defineProps({
    currentManualPath: {
        type: String,
        default: '/'
    }
});

const { data: navigation } = await useAsyncData('navigation', () =>
    fetchContentNavigation()
);

// const manualBaseUrl = useRoute().path.split(`/`)[1];
const manualBaseUrl = "manual"
const processNavigationObjPath = (navigationObj: NavItem) => {
    navigationObj._path = manualBaseUrl + navigationObj._path;
    if (navigationObj.children) {
        navigationObj.children.forEach((navigationObjChildren: NavItem) => {
            processNavigationObjPath(navigationObjChildren);
        });
        
    }
};

const processNavigationPaths = () => {
    navigation.value?.map(navigationObj => {
    processNavigationObjPath(navigationObj)
}) 
}

onMounted(() => {
    // processNavigationPaths();
})

</script>
