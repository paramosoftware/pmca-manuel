<template>
<NuxtLayout name="public">
   <div class="px-2 md:px-0 mb-auto">
      <PublicEntry :entry="entry" />
   </div>
</NuxtLayout>

 </template>
 
 <script setup lang="ts">
definePageMeta({
   layout: false,
});
 
const router = useRouter();
const config = useRuntimeConfig();

const { data, pending, error } = await useFetchWithBaseUrl(`/api/entries/by-slug`, {
    method: 'POST',
    body: JSON.stringify({
        slug: router.currentRoute.value.params.slug
    })
});


const entry = ref(data as unknown as Entry);
const url = ref('');
const description = ref(entry.value.definition ? entry.value.definition.replace(/<[^>]*>?/gm, '').substring(0, 150) : '');

if (entry.value.media && entry.value.media.length > 0) {
   const image = entry.value.media[0].media?.name;
   if (process.client) {
      url.value  =  window.location.protocol + '//' + window.location.host + '/media/' + image;
   }
}

useHead({
    title: entry.value.name + ' | ' + config.public.appName,
    meta: [
         { hid: 'description', name: 'description', content: description.value },
         { hid: 'og:title', property: 'og:title', content: entry.value.name },
         { hid: 'og:description', property: 'og:description', content: description.value },
         { hid: 'og:image', property: 'og:image', content: url.value,}
    ],
});
 </script>
