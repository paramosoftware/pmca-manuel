export default function useConceptAccess(slug: string) {
    const countAccess = ref(false);

    onMounted(() => {
        if (process.client) {
            const conceptAccessStorage =
                localStorage.getItem('conceptAccess') || '[]';
            const conceptAccess = JSON.parse(conceptAccessStorage);

            const access = {
                slug: slug,
                date: new Date().toISOString()
            };

            const found = conceptAccess.find(
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
                conceptAccess.push(access);
                countAccess.value = true;
            }

            if (conceptAccess.length > 10) {
                conceptAccess.shift();
            }

            localStorage.setItem(
                'conceptAccess',
                JSON.stringify(conceptAccess)
            );
        }
    });

    return { countAccess };
}
