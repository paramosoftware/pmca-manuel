<template>
    <nav id="navbar" class="p-3 border-b bg-white shadow-sm rounded-sm">
        <div class="max-w-screen-xl mx-auto md:flex flex-row justify-between items-center">
            <div class="w-full md:w-2/6">
                <NuxtLink to="/">
                    <img
                        src="/icons/icon-horizontal.png"
                        alt="Logo"
                        class="h-8"
                    />
                </NuxtLink>
                <p
                    class="text-xl mt-2 text-app-primary font-semibold line-clamp-2"
                    :title="glossaryName"
                >
                    {{ glossaryName }}
                </p>
            </div>
            <div class="w-full md:w-4/6 mt-5 md:mt-0 md:flex flex-row justify-end items-center">
                <div class="flex flex-row justify-end items-center">
                    <span v-for="menu in menus" :key="menu.title">
                        <span v-if="menu.items" class="mr-4">
                            <UDropdown
                                :items="menu.items"
                                :popper="{ placement: 'bottom-end' }"
                            >
                                <UAvatar size="sm">
                                    <UIIcon
                                        :name="menu.icon"
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
    </nav>
</template>

<script setup lang="ts">
import ROUTES from '~/config/routes';
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
