<template>
    <div>
        <h1>Create Entry</h1>
        <form @submit.prevent="createEntry">
            <input type="text" v-model="title" placeholder="Title" />
            <input type="text" v-model="content" placeholder="Content" />
            <button type="submit" :disabled="!title || !content">Create</button>
        </form>
    </div>
    <div v-if="pending">
        <h1>Loading...</h1>
    </div>

    <div v-else-if="error">
        <h1>Error</h1>
    </div>

    <div v-else>
        <h1>Entries</h1>
        <ul>
            <li v-for="entry in entries" :key="entry.id">
                <h2>{{ entry.title }}</h2>
                <p>{{ entry.content }}</p>

                <button @click="deleteEntry(entry.id)">Delete</button>
            </li>

        </ul>
    </div>
</template>

<script setup lang="ts">

let entries = ref([]);

const { pending, error } = await useLazyAsyncData(async () => {
  const getEntries = await fetch('/api/entries').then((res) =>
    res.json()
  )

  entries.value = getEntries;
}, { server: false });

const title = ref('');
const content = ref('');


const createEntry = async () => {
    const newEntry = {
        title: title.value,
        content: content.value,
    };

    const create = await fetch('/api/entries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
    }).then((res) => res.json());

    entries.value = [...entries.value, create];
    title.value = '';
    content.value = '';
};


const deleteEntry = async (id) => {
    const deleteEntry = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
    }).then((res) => res.json());

    entries.value = entries.value.filter((entry) => entry.id !== id);
};

</script>


<style scoped>

body {
    background-color: #f0f0f0;
    color: #333;
    margin: 0;
    padding: 0;
}

div {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
}

ul {
    list-style: none;
    margin: 0;
    padding: 0;
}


li {
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    display: block;
    margin: 0 0 1rem;
    padding: 1rem;
}

form input {
    background-color: #fff;
    border: 1px solid #ddd;
    margin: 0 0 1rem;
    padding: 0.5rem 1rem;
    width: 90%;
}


button {
    background-color: #333;
    border: 0;
    color: #fff;
    cursor: pointer;
    margin: 0 0 0.5rem;
    padding: 0.5rem 1rem;
}
</style>