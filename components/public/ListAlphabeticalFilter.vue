<template>
    <ul
        class="flex flex-row items-center mt-5 overflow-x-auto max-w-full lg:justify-center px-1"
    >
        <li
            v-for="(letter, index) in alphabetArr"
            :key="index"
            class="border border-gray-200 px-3 py-1 lg:min-w-10 text-center hover:bg-pmca-green-500 hover:text-white last:rounded-tr last:rounded-br first:rounded-tl first:rounded-bl"
            :class="
                searchInitialLetter === letter
                    ? 'border-0 text-2xl text-white bg-pmca-accent'
                    : ''
            "
            @click="conceptStore.searchInitialLetter = letter"
        >
            {{ letter }}
        </li>
    </ul>
</template>

<script setup lang="ts">
const alphabetArr = 'TODOS-A-B-C-D-E-F-G-H-I-J-K-L-M-N-O-P-Q-R-S-T-U-V-W-X-Y-Z'.split('-');
const conceptStore = useConceptStore();
const { searchInitialLetter } = storeToRefs(conceptStore);

</script>

<style scoped>
::-webkit-scrollbar {
    height: 5px;
}
</style>