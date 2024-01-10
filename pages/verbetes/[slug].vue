<template>
<NuxtLayout name="public">
   <div class="px-2 mb-auto">
      <PublicEntry :entry="entry" />
   </div>
</NuxtLayout>

 </template>
 
<script setup lang="ts">
import QUERIES from '~/config/queries';

definePageMeta({
   layout: false,
});
 
const router = useRouter();
const config = useRuntimeConfig();
const countAccess = ref(false);
const slug = ref(router.currentRoute.value.params.slug);


// TODO: Move to composables
if (process.client) {

   const entryAccessStorage = localStorage.getItem('entryAccess') || '[]';
   const entryAccess = JSON.parse(entryAccessStorage);

   const access = {
      slug: slug.value,
      date: new Date().toISOString()
   };

   const found = entryAccess.find((item: { slug: string | string[]; date: string | number | Date; }) => {
      if (item.slug === slug.value) {
         const date = new Date(item.date);
         const now = new Date();
         const diff = Math.abs(now.getTime() - date.getTime());
         const minutes = Math.floor((diff / 1000) / 60);

         item.date = new Date().toISOString();

         if (minutes > 10) {
            countAccess.value = true;
         }

         return true;
      }

      return false;
   });

   if (!found) {
      entryAccess.push(access);
      countAccess.value = true;
   }

   if (entryAccess.length > 10) {
      entryAccess.shift();
   }

   localStorage.setItem('entryAccess', JSON.stringify(entryAccess));
}

// TODO: Track access to entries
const { data, pending, error } = await useFetchWithBaseUrl('/api/entry?query=' + JSON.stringify({
   where: {
      nameSlug: slug.value,
   },
   include: QUERIES.get('Entry')?.include|| undefined,
}));



if (!data.value.items[0]) {
   //TODO: Redirect to 404
}

const entry = ref(data.value.items[0] as unknown as Entry);
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
