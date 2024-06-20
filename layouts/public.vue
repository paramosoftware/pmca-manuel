<template>
    <div
        class="flex flex-col min-h-screen max-h-auto  text-pmca-primary text-lg bg-gray-50"
    >
        <PublicNavbar />

        <div class="h-auto flex flex-col flex-grow justify-start items-start min-h-[40vh] w-full px-3 py-5 md:px-6 lg:px-8 xl:px-10">
            <div class="flex flex-col h-full w-full flex-grow  justify-start ">
                <div class="h-full flex flex-col flex-grow min-w-full max-h-auto max-w-screen-2xl ">
                    <slot />
                </div>
    
            </div>
        </div>

        <Footer class="mt-auto"/>

        <UNotifications />
    </div>
   <UILoading />
</template>