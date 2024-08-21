<template>
    <nav id="navbar" class="p-3 border-b bg-white shadow-sm rounded-sm">
        <div
            class="max-w-screen-xl mx-auto md:flex flex-row justify-between items-center"
        >
            <div class="w-full md:w-3/6">
                <img
                    src="/icons/icon-horizontal.png"
                    alt="Logo"
                    class="h-8 cursor-pointer"
                    @click="navigateTo('/admin')"
                />
                <UIGlossarySelector class="mt-3" :public="false" />
            </div>
            <div
                class="w-full md:w-3/6 mt-5 md:mt-0 md:flex flex-row justify-end items-center"
            >
                <div class="flex flex-row justify-end items-center">
                    <span v-for="menu in menus" :key="menu.title">
                        <span v-if="menu.items" class="mr-4">
                            <UDropdown
                                :items="menu.items"
                                :popper="{ placement: 'bottom-end' }"
                            >
                                <template #item="{ item }">
                                    <UILink :href="item.href">
                                        {{ item.label }}
                                    </UILink>
                                </template>

                                <UAvatar size="sm">
                                    <UILink :href="menu.href">
                                        <UIIcon
                                            :name="menu.icon"
                                            :title="menu.title"
                                        />
                                    </UILink>
                                </UAvatar>
                            </UDropdown>
                        </span>
                        <span v-else-if="menu.onClick" class="mr-4">
                            <UAvatar size="sm">
                                <UILink :href="menu.href">
                                    <UIIcon
                                        :name="menu.icon"
                                        :title="menu.title"
                                    />
                                </UILink>
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

const menus = [
    {
        icon: 'ph:list',
        title: 'Listar',
        items: [
            resources.value.map((resource: Resource) => {
                return {
                    label: resource.labelPlural,
                    href: ROUTES.list + resource.labelSlug,
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
        href: ROUTES.export,
        onClick: () => {
            navigateTo(ROUTES.export);
        }
    }
] as any[];

if (canImport.value) {
    menus.push({
        icon: 'ph:box-arrow-up',
        title: 'Importar',
        href: ROUTES.import,
        onClick: () => {
            navigateTo(ROUTES.import);
        }
    });
}

if (userStore.isAdmin) {
    menus.push({
        icon: 'ph:archive',
        title: 'Backup',
        href: ROUTES.backup,
        onClick: () => {
            navigateTo(ROUTES.backup);
        }
    });
}

menus.push({
    icon: 'ph:arrow-square-out',
    title: 'Acesso público',
    href: '/',
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
                href: ROUTES.restricted + '/alterar-senha',
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
