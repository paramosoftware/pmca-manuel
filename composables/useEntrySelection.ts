export const useEntrySelection = () => {
    if (!process.client) return { isSelected: () => false, toggle: () => false, getSelected: () => [], clearSelected: () => false };

    const getSelected = () => {
        try {
            return JSON.parse(localStorage.getItem('selectedEntries') ?? '[]');
        } catch (error) {
            clearSelected();
            return [];
        }
    }

    const isSelected = (id: ID) => {
        return getSelected().includes(id);
    }

    const toggle = (event: Event, id: ID) => {
        event?.stopPropagation();
        event?.preventDefault();

        let selectedEntries = getSelected();
        const index = selectedEntries.indexOf(id);

        if (index !== -1) {
            selectedEntries.splice(index, 1);
        } else {
            selectedEntries.push(id);
        }

        localStorage.setItem('selectedEntries', JSON.stringify(selectedEntries));

        return index === -1;
    }

    const clearSelected = () => {
        localStorage.removeItem('selectedEntries');
    }

    return { isSelected, toggle, getSelected, clearSelected }
}



