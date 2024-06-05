<template>
    <div
        class="flex flex-col min-h-screen justify-between text-pmca-primary text-lg bg-gray-50"
    >
        <PublicNavbar />

        <div class="mb-auto">
            <div class="p-1 md:p-3 mx-auto mt-5">
                <div class="w-full mb-8">
                    <slot />
                </div>
            </div>
        </div>

        <Footer />

        <UNotifications />
    </div>
   <UILoading />
</template>