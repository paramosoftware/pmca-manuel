<template>
    <div>
        <vue-dropzone ref="myVueDropzone" id="dropzone" 
        :options="dropzoneOptions" 
        />
        <input type="hidden" name="entryId" :value="entryId">
        
        <div class="mt-5 text-end">
            <Button @click="uploadFiles" label="UPLOAD" class="mx-auto" />
        </div>
    </div>
</template>
  
  
  
<script setup>
import vueDropzone from 'vue2-dropzone-vue3';

const myVueDropzone = ref(null);
const emit = defineEmits(['update']);

const dropzoneOptions = {
    url: '/api/upload',
    maxFilesize: 5,
    maxFiles: 20,
    thumbnailWidth: 150,
    thumbnailHeight: 200,
    acceptedFiles: 'image/*',
    dictInvalidFileType: 'Tipo de arquivo inválido',
    dictFileTooBig:' Arquivo maior que o permitido: {{maxFilesize}} MB',
    dictRemoveFile: 'REMOVER',
    dictDefaultMessage: 'Clique ou arraste e solte os arquivos aqui para fazer upload',
    clickable: true,
    autoProcessQueue: false,
    addRemoveLinks: true,
    sending: function (file, xhr, formData) {
        formData.append(
            'entryId',
            document.querySelector('input[name=entryId]').value
        );
    },
    success: function (file, response) {
        emit('update', response);
    },

};

const uploadFiles = () => {
    myVueDropzone.value.processQueue();
};


defineComponent({
    components: {
        vueDropzone,
    },
});

defineProps({
    id : {
        type: String,
        required: true
    },
    entryId: {
        type: Number,
        required: true
    }
})

</script>

  
<style>

.vue-dropzone > .dz-preview .dz-details {
    background-color: rgba(0, 0, 0, 0.5);
}

.vue-dropzone > .dz-preview .dz-error-mark {
    width: auto;
    pointer-events: none;
    opacity: 0;
    z-index: 500;
    position: absolute;
    display: block;
    top: 50%;
    left: 50%;
    margin-left: -27px;
    margin-top: -27px;
    background: #b10606;
    border-radius: 50%;
}

.vue-dropzone > .dz-preview .dz-success-mark {
    background: green;
}

</style>
