export const useConceptSelection = () => {
    if (!process.client)
        return {
            isSelected: () => false,
            toggle: () => false,
            getSelected: () => [],
            clearSelected: () => false
        };

    const getSelected = () => {
        try {
            return JSON.parse(localStorage.getItem('selectedConcepts') ?? '[]');
        } catch (error) {
            clearSelected();
            return [];
        }
    };

    const isSelected = (id: ID) => {
        return getSelected().includes(id);
    };

    const toggle = (event: Event, id: ID) => {
        event?.stopPropagation();
        event?.preventDefault();

        let selectedConcepts = getSelected();
        const index = selectedConcepts.indexOf(id);

        if (index !== -1) {
            selectedConcepts.splice(index, 1);
        } else {
            selectedConcepts.push(id);
        }

        localStorage.setItem(
            'selectedConcepts',
            JSON.stringify(selectedConcepts)
        );

        return index === -1;
    };

    const clearSelected = () => {
        localStorage.removeItem('selectedConcepts');
    };

    return { isSelected, toggle, getSelected, clearSelected };
};
