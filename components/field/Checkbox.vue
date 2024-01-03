<template>

    <div class="flex flex-row items-center">
        <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-pmca-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pmca-accent"
            :id="id"
            :checked="modelValue"
            @input="handleInput"
        />
        <label :for="id" class="ml-2 block text-pmca-primary">
            {{ label }}
        </label>
    </div>
    

</template>

<script setup lang="ts">

const props = defineProps({
    id: String,
    label: String,
    modelValue: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.checked);
}
</script>