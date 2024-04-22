export default function useEntryAccess(slug: string) {
    const countAccess = ref(false);

    onMounted(() => {
        if (process.client) {
            const entryAccessStorage =
                localStorage.getItem('entryAccess') || '[]';
            const entryAccess = JSON.parse(entryAccessStorage);

            const access = {
                slug: slug,
                date: new Date().toISOString()
            };

            const found = entryAccess.find(
                (item: { slug: string; date: string }) => {
                    if (item.slug === slug) {
                        const date = new Date(item.date);
                        const now = new Date();
                        const diff = Math.abs(now.getTime() - date.getTime());
                        const minutes = Math.floor(diff / 1000 / 60);

                        item.date = new Date().toISOString();

                        if (minutes > 10) {
                            countAccess.value = true;
                        }

                        return true;
                    }

                    return false;
                }
            );

            if (!found) {
                entryAccess.push(access);
                countAccess.value = true;
            }

            if (entryAccess.length > 10) {
                entryAccess.shift();
            }

            localStorage.setItem('entryAccess', JSON.stringify(entryAccess));
        }
    });

    return { countAccess };
}
