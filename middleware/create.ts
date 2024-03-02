import ROUTES from "~/config/routes";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore();
  await userStore.fetch();

  const resourceStore = useResourceStore();
  await resourceStore.fetch(to.params?.path as string);

  const { permissions } = storeToRefs(userStore);
  const { model } = storeToRefs(resourceStore);

  if (
    !permissions.value[model.value] ||
    !permissions.value[model.value].create
  ) {
    return navigateTo(ROUTES.restricted, { replace: true });
  }

});
