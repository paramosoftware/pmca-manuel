export default function useExportData() {
    const loading = ref(false);
    const toast = useToast();
    const title = ref('Preparando arquivo(s)...');

    //TODO: feat: implement progress bar

    async function download(url: string, filename?: string) {
        loading.value = true;
        const exportToast = toast.add({
            title: title.value,
            icon: 'i-heroicons-archive-box-arrow-down',
            ui: {
                rounded: 'rounded-sm',
                padding: 'p-5',
                icon: { color: 'text-pmca-accent' }
            },
            closeButton: {
                disabled: true
            },
            timeout: 0
        });

        let response;
        let blob;

        try {
            response = await fetch(url);
            const contentLength = response.headers.get('content-length');
            let progress = 0;

            if (contentLength && Number(contentLength) > 25000000) {    
                const stream = response.body!;
                const reader = stream.getReader();
                const content = [];
                let receivedBytes = 0;
                let done = false;
                while (!done) {
                    const { value, done: doneValue } = await reader.read();
                    if (value) {
                        content.push(value);
                        receivedBytes += value.length;
                        progress = Math.round((receivedBytes / Number(contentLength)) * 100);
                    }
                    done = doneValue;
                }
                blob = new Blob(content);
            } else {
                blob = await response.blob();
            }

        } catch (error) {
            toast.remove(exportToast.id);
            loading.value = false;

            toast.add({
                title: 'Erro ao exportar arquivo(s)',
                icon: 'i-heroicons-exclamation-circle',
                ui: {
                    rounded: 'rounded-sm',
                    padding: 'p-5',
                    icon: { color: 'text-red-500' },
                    timeout: 0
                }
            });
            return;
        }

        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        const header = response.headers.get('Content-Disposition');
        const parts = header?.split(';');
        if (parts && parts.length > 1) {
            filename = parts[1].split('=')[1].replaceAll('"', '');
        }
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(a.href);
        toast.remove(exportToast.id);
        loading.value = false;
    }

    return { loading, title, download };
}
