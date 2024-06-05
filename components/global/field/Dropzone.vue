<template>
    <div>
        <div class="mb-5 text-end">
            <UIButton @click="uploadFiles" class="mx-auto"> Upload </UIButton>
        </div>

        <slot></slot>

        <vue-dropzone
            ref="myVueDropzone"
            id="dropzone"
            :options="dropzoneOptions"
        />
    </div>
</template>

<script setup>
import vueDropzone from 'vue2-dropzone-vue3';

const props = defineProps({
    url: {
        type: String,
        required: true
    },
    acceptedFiles: {
        type: String,
        default: 'image/*'
    },
    maxFilesize: {
        type: Number,
        default: 20
    },
    maxFiles: {
        type: Number,
        default: 20
    },
    params: {
        type: Object,
        default: () => ({})
    }
});

const myVueDropzone = ref(null);
const emit = defineEmits(['start', 'update', 'close']);

const dropzoneOptions = {
    url: props.url,
    timeout: 180000, // 3 minutes
    maxFilesize: props.maxFilesize,
    maxFiles: props.maxFiles,
    thumbnailWidth: 150,
    thumbnailHeight: 200,
    acceptedFiles: props.acceptedFiles,
    dictInvalidFileType: 'Tipo de arquivo inválido',
    dictFileTooBig: ' Arquivo maior que o permitido: {{maxFilesize}} MB',
    dictRemoveFile: 'Remover',
    dictDefaultMessage:
        'Clique ou arraste e solte os arquivos aqui para fazer upload',
    clickable: true,
    autoProcessQueue: false,
    addRemoveLinks: true,
    sending: function (file, xhr, formData) {
        const csrfToken = useCookie(getCookiePrefix() + 'csrf');
        xhr.setRequestHeader(
            'X-CSRF-Token',
            csrfToken.value ? csrfToken.value : ''
        );
        for (const key in props.params) {
            formData.append(key, props.params[key]);
        }
        emit('start');
    },
    success: function (file, response) {
        if (response) {
            emit('update', response);
        }

        if (
            myVueDropzone.value.getUploadingFiles().length === 0 &&
            myVueDropzone.value.getQueuedFiles().length === 0
        ) {
            emit('close');
        }
    }
};

const uploadFiles = () => {
    myVueDropzone.value.processQueue();
};

defineComponent({
    components: {
        vueDropzone
    }
});
</script>

<style>
.vue-dropzone > .dz-preview .dz-details {
    background-color: rgba(0, 0, 0, 0.5);
}

.vue-dropzone > .dz-preview .dz-error-mark {
    width: auto;
    cursor: pointer;
    opacity: 0;
    z-index: 500;
    position: absolute;
    display: block;
    top: 50%;
    left: 50%;
    margin-left: -27px;
    margin-top: -27px;
    background: #c71c1cd0;
    border-radius: 50%;
}

.dropzone .dz-preview .dz-error-message {
    top: 10%;
    background: #c71c1cc5;
}

.vue-dropzone > .dz-preview .dz-success-mark {
    background: green;
}

.vue-dropzone > .dz-preview .dz-remove {
    right: 28%;
    text-transform: capitalize;
    background: #c71c1cc5;
}
</style>
