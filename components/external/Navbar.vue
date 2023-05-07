<template>
    <nav id="navbar" class="sticky w-full top-0 left-0 right-0 z-10 p-4 border-b border-neutral-100 bg-neutral-100">
    <div class="flex items-center justify-between">
      <div>
        <Icon name="ph:list" class="text-2xl text-black" />
      </div>

      <div class="flex items-center">
        <form id="search">
          <label for="default-search" class="mb-2 text-sm font-medium text-black sr-only">Search</label>
          <div class="relative md:w-[500px]">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon name="ph:magnifying-glass" class="text-black w-5 h-5" />
            </div>
            <input type="search" id="default-search"
              class="w-full p-4 pl-10 text-sm text-black border-black bg-transparent focus: focus:outline-none  focus:ring-2 focus:ring-black focus:border-transparent"
              required>
            <button type="submit" class="text-black absolute right-2.5 bottom-2.5 text-sm px-4 py-2">Buscar</button>
          </div>
        </form>
      </div>
    </div>
  </nav>
</template>