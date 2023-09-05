export const useEntrySelection = () => {

    if (!process.client) return { isSelected: () => false, handleEntrySelection: () => { }, selectedEntries: [] }

    const selectedEntries = JSON.parse(localStorage.getItem('selectedEntries')!) || [];

    const isSelected = (id: number) => {
        return selectedEntries.includes(id);
    }

    const handleEntrySelection = (event: Event, id: number) => {

        event.stopPropagation();
        event.preventDefault();

        let selectedEntry = isSelected(id);

        if (selectedEntry) {
            const index = selectedEntries.indexOf(id);
            selectedEntries.splice(index, 1);
            selectedEntry = false;
        } else {
            selectedEntries.push(id);
            selectedEntry = true;
        }

        localStorage.setItem('selectedEntries', JSON.stringify(selectedEntries));

        return selectedEntry
    }

    return { isSelected, handleEntrySelection, selectedEntries }
}


