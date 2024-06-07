<template>
    <div
        class="flex flex-col min-h-screen justify-between text-pmca-primary text-lg bg-gray-50"
    >
        <PublicNavbar />

        <div class="mb-auto">
            <div class="pr-1 pl-1 md:pl-2 md:pr-2 mx-auto">
                <div class="w-full mb-2">
                    <slot />
                </div>
            </div>
        </div>

        <Footer />

        <UNotifications />
    </div>
   <UILoading />
</template>