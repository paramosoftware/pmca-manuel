export const useComponentExists = (component: string) => {
    const instance = getCurrentInstance();

    return typeof instance?.appContext.components === "object" && 
        component in instance.appContext.components
}