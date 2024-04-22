export const useLoadingStore = defineStore('loading', () => {
    const loading = ref(false);
    const progress = ref(0);
    let intervalId = null as any;

    function start() {
        if (typeof window !== 'undefined') {
            loading.value = true;
            progress.value = 0;

            let milliseconds = 200;

            intervalId = setInterval(() => {
                if (progress.value < 50) {
                    progress.value++;
                } else if (progress.value < 90) {
                    milliseconds += 100;
                    progress.value += 0.5;
                } else if (progress.value < 95) {
                    milliseconds += 200;
                    progress.value += 0.1;
                } else if (progress.value < 99) {
                    milliseconds += 400;
                    progress.value += 0.05;
                }
            }, milliseconds);
        }
    }

    function stop() {
        if (typeof window !== 'undefined') {
            clearInterval(intervalId);

            intervalId = setInterval(() => {
                if (progress.value < 100) {
                    progress.value++;
                }
            }, 100);

            loading.value = false;
            progress.value = 0;
        }
    }

    return {
        loading,
        progress,
        start,
        stop
    };
});
