<template>
    <div class="container mx-auto mb-auto p-2">
        <div class="flex flex-col justify-left">

            <UIPageTitle>Importar</UIPageTitle>

            <p class="mt-4">
                É possível importar verbetes para o sistema nos formatos: <strong>JSON, CSV, XLXS e SKOS</strong> (extensão .xml).
            </p>

            <p class="mt-4">
                Os dados devem estar no formato correto para que a importação seja realizada com sucesso. Abaixo é possível visualizar um exemplo de cada formato.
                Arquivos exportados pelo sistema (pelo site ou outras instâncias), em qualquer formato, podem ser utilizados para importação sem necessidade de alterações.
            </p>

            <p class="mt-4">
                <Icon name="ph:warning" class="h-10 w-10 text-pmca-warning mr-3" />

                <strong>Atenção:</strong> a importação sobrescreve os dados existentes no sistema.
            </p>


            <UDivider class="mt-4 mb-4" />


            <div class="grid grid-cols-1 md:grid-cols-2 gap-6" v-show="!importing && !completed">

                <div>
                    <FieldSelect id="formato" label="Formato" :options="options" :required="true" v-model="importFormat" />

                    <p class="text-pmca-secondary text-lg mt-4">
                        Exemplo de arquivo
                    </p>

                    <!-- TODO: add example files -->
                    
                </div>

                <div class="p-10">

                    <!-- TODO: add check box to confirm overwrite -->

                    <FieldDropzone url="/api/entry/import" 
                        :max-files=1
                        accepted-files="application/json, application/xml, application/zip, text/csv, text/xml" 
                        @start='importing=true' 
                        @close='completed=true; importing=false'
                    />
                </div>
            </div>


            <div class="mx-auto my-0 h-full mt-20" v-if="importing">
                <div class="flex flex-col justify-center items-center">
                    <Icon name="ph:spinner" class="h-16 w-16 animate-spin text-pmca-primary" />
                </div>
                <p>Importando...</p>
            </div>

            <div class="mx-auto my-0 h-full mt-20" v-if="completed">
                <div class="flex flex-col justify-center items-center">
                    <Icon name="ph:check-circle" class="h-16 w-16 text-pmca-accent" />
                </div>
                <p>Importação concluída!</p>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
});

useHead({
    title: 'Importar | ' + useRuntimeConfig().public.appName,
});


const importing = ref(false);
const completed = ref(false);

const importFormat = ref({
    id: 'json',
    name: 'JSON'
});

const options = ref([
   // { id: 'xlxs', name: 'XLXS (Excel)' },
   // { id: 'csv', name: 'CSV' },
    { id: 'json', name: 'JSON' },
    { id: 'xml', name: 'SKOS (Simple Knowledge Organization System)' }
]);

</script>