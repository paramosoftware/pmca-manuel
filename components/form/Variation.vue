<template>
    <Form 
        singular-name="variation" 
        plural-name="variations" 
        singular-name-pt="variação" 
        plural-name-pt="variações"
        :object=variation 
        :is-create="variation.id == 0" 
        :is-standalone=false
        @auxiliary-saved="updateParent"
        :save-object=false
        >

        <input type="hidden" v-model="variation.entry.id" id="entryId" />

        <FieldInput label="Variação" v-model="variation.name" id="name" type="text" placeholder="Variação" :show-label="false" :required="true" />

    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ variation?: Variation, entryId: number }>();

const variation = ref<Variation>(
    props.variation ?? {
        id: 0,
        name: '',
        entry: {
            id: props.entryId,
            name: '',
        }
    }
);

const updateModel = (property: string, action: string, item: any) => {
    if (variation.value) {
        if (action === 'add') {
            variation.value[property] = item;
            
        } else if (action === 'remove') {
            variation.value[property] = {id: 0, name: ''}
        }
    }
}

const emit = defineEmits(['update'])

const updateParent = (variation : Variation) => {
    emit('update', 'variations', 'add',  variation)
}

</script>
