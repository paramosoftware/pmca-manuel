export function destroyStore(store: any) {
    const pinia = usePinia();
    const id = store.$id;
    store.$dispose();
    delete pinia.state.value[id];
}
