export function useOnClickOutside(element: Ref<HTMLElement | null>, onClickOutside: (event: Event) => void) {
    const onClick = (event: Event) => {
        if (element.value && !element.value.contains(event.target as Node)) {
            onClickOutside(event);
        }
    };

    onMounted(() => {
        document.addEventListener('click', onClick);
    });

    onUnmounted(() => {
        document.removeEventListener('click', onClick);
    });
}


