<template>
    <nav id="navbar" class="p-4 border-b-2 bg-white shadow-sm rounded-md">
        <div class="max-w-screen-xl mx-auto">
            <div class="grid grid-cols-4 md:grid-cols-12 gap-4">
                <div class="mt-1">
                    <NuxtLink to="/admin">
                        <img
                            src="/icons/icon-horizontal.png"
                            alt="Logo"
                        />
                    </NuxtLink>
                </div>
                <div class="col-span-3 md:col-span-4">
                    <div class="flex flex-col justify-between">
                        <div>
                            <h1 class="text-2xl font-semibold flex-row mb-2">
                                {{ title }}
                            </h1>
                            <p class="text-sm text-gray-500 truncate">
                                {{ glossaryName }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-span-4 md:col-span-7">
                    <div class="flex flex-row justify-end align-bottom">
                        <span v-for="menu in menus" :key="menu.title">
                            <span v-if="menu.items" class="mr-4">
                                <UDropdown
                                    :items="menu.items"
                                    :popper="{ placement: 'bottom-end' }"
                                >
                                    <UAvatar size="sm">
                                        <UIIcon
                                            :name="menu.icon"
                                            class="h-6 w-6"
                                            :title="menu.title"
                                        >
                                        </UIIcon>
                                    </UAvatar>
                                </UDropdown>
                            </span>
                            <span v-else-if="menu.onClick" class="mr-4">
                                <UAvatar size="sm">
                                    <UIIcon
                                        :name="menu.icon"
                                        class="h-6 w-6"
                                        :title="menu.title"
                                        @click="menu.onClick"
                                    >
                                    </UIIcon>
                                </UAvatar>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import ROUTES from '~/config/routes';
const config = useRuntimeConfig();
const title = ref(config.public.appName);
const isElectronApp = isElectron();

const userStore = useUserStore();
await userStore.fetch();
const { name, resources, canImport } = storeToRefs(userStore);

const glossaryStore = useGlossaryStore();
await glossaryStore.fetch();
const { name: glossaryName } = storeToRefs(glossaryStore);

const menus = [
    {
        icon: 'ph:list',
        title: 'Listar',
        items: [
            resources.value.map((resource: Resource) => {
                return {
                    label: resource.labelPlural,
                    click: () => {
                        navigateTo(ROUTES.list + resource.labelSlug);
                    }
                };
            })
        ]
    },
    {
        icon: 'ph:box-arrow-down',
        title: 'Exportar',
        onClick: () => {
            navigateTo(ROUTES.export);
        }
    }
] as any[];

if (canImport.value) {
    menus.push({
        icon: 'ph:box-arrow-up',
        title: 'Importar',
        onClick: () => {
            navigateTo(ROUTES.import);
        }
    });
}

if (userStore.isAdmin) {
    menus.push({
        icon: 'ph:archive',
        title: 'Backup',
        onClick: () => {
            navigateTo(ROUTES.backup);
        }
    });
}

menus.push({
    icon: 'ph:arrow-square-out',
    title: 'Acesso público',
    onClick: () => {
        accessPublic();
    }
});

menus.push({
    icon: 'ph:user-circle',
    title: 'Opções do usuário',
    items: [
        [
            {
                label: name.value,
                disabled: true
            },
            {
                label: 'Alterar senha',
                click: () => {
                    navigateTo(ROUTES.restricted + '/alterar-senha');
                }
            },
            {
                label: 'Sair',
                click: () => {
                    logout();
                }
            }
        ]
    ]
});

const logout = async () => {
    await userStore.logout();
    navigateTo('/');
};

const accessPublic = () => {
  if (isElectronApp) {
    navigateTo('/');
  } else {
    window.open('/', '_blank');
  }
};


</script>
