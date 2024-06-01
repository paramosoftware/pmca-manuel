<template>
    <div
        class="flex flex-col h-screen justify-between text-pmca-primary text-lg"
    >
        <PublicNavbar />

        <main class="mb-auto">
            <div class="p-1 md:p-3 mx-auto mt-5">
                <div class="w-full mb-8">
                    <slot />
                </div>
            </div>
        </main>

        <Footer />

        <UNotifications />
    </div>
   <UILoading />
</template>