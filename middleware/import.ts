import ROUTES from "~/config/routes";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore();
  await userStore.fetch();

  const { permissions } = storeToRefs(userStore);

  if (!permissions.value?.Entry?.import) {
    return navigateTo(ROUTES.restricted);
  }
});
