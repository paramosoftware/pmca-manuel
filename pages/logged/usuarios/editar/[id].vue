<template>
    <UserForm :user="user" />
</template>

<script setup lang="ts">

const user = ref<User>();

const router = useRouter();
const { data } = await useFetchWithBaseUrl(`/api/users/${router.currentRoute.value.params.id}`);

// TODO: check if there is a better way 
user.value = data.value;

</script>