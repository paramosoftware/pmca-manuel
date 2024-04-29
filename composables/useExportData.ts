export default function useExportData() {
    const loading = ref(false);
    const toast = useToast();

    //TODO: feat: implement progress bar

    async function download(
        format: DataTransferFormat,
        addMedia: boolean = false,
        where?: Where
    ) {
        const exportToast = toast.add({
            title: 'Exportando...',
            icon: 'i-heroicons-archive-box-arrow-down', // TODO: change to ph:download
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

        let filename = 'export-' + Date.now() + '.' + addMedia ? 'zip' : format;

        const response = await fetch(
            '/api/concept/export?format=' +
                format +
                '&addMedia=' +
                addMedia +
                (where ? '&where=' + JSON.stringify(where) : '')
        );

        const blob = await response.blob();
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        const header = response.headers.get('Content-Disposition');
        const parts = header?.split(';');
        if (parts && parts.length > 1) {
            filename = parts[1].split('=')[1].replaceAll('"', '');
        }
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(a.href);
        toast.remove(exportToast.id);
    }

    return { loading, download };
}
