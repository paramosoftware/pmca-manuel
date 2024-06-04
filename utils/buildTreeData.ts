import parseNumber from './parseNumber';

export function buildTreeData(
    hierarchalItems: HierarchicalItem[],
    addRootNode: boolean = true,
    nodeIdToExpand?: ID,
    nodeIdToRemove?: ID,
    leavesKey?: string, // when the leaves are in a different key
    nodeIdExistent?: ID // TODO: temporary solution to for finder component to work when the defaultExpanded value does not exist in the tree
): TreeNode[] | [TreeNode, boolean] {
    const tempLabel = '___' + Math.random().toString(36).substring(7);
    const nodeMap = new Map<ID, TreeNode>();
    const rootNode = createNode({
        id: 'root',
        name: 'Root',
        parentId: null,
        children: []
    });
    let nodeIdExist = false;

    let nodeExpanded = [];

    if (!rootNode) {
        return [];
    }

    for (const item of hierarchalItems) {
        if (!nodeIdExist && nodeIdExistent) {
            nodeIdExist = parseNumber(nodeIdExistent) === parseNumber(item.id);
        }

        let currentNode = nodeMap.get(item.id);

        if (currentNode && currentNode.label === tempLabel) {
            const replaceNode = createNode(
                item,
                nodeIdToExpand,
                nodeIdToRemove,
                leavesKey
            );
            if (!replaceNode) {
                continue;
            }
            replaceNode.children = currentNode.children;
            nodeMap.set(item.id, replaceNode);
            currentNode = replaceNode;
        }

        let tempNode = createNode(
            item,
            nodeIdToExpand,
            nodeIdToRemove,
            leavesKey
        );

        if (!tempNode) {
            continue;
        }

        if (!currentNode) {
            currentNode = tempNode;
            nodeMap.set(item.id, currentNode);
        }

        if (!currentNode) {
            continue;
        }

        if (item.parentId === null) {
            currentNode.parentId = rootNode.id;
            rootNode.children.push(currentNode);
        } else {
            let parentNode = nodeMap.get(item.parentId);
            let tempNode = createNode(
                {
                    id: item.parentId,
                    name: tempLabel,
                    parentId: null,
                    children: []
                },
                nodeIdToExpand,
                nodeIdToRemove,
                leavesKey
            );

            if (!tempNode) {
                continue;
            }

            if (!parentNode) {
                parentNode = tempNode;
                nodeMap.set(item.parentId, parentNode);
            }

            if (currentNode.expanded) {
                nodeExpanded.push(currentNode.id)
            }

            parentNode.children.push(currentNode);
        }
    }

    if (nodeExpanded.length > 0) {
        for (const nodeId of nodeExpanded) {
            let currentNode = nodeMap.get(nodeId);
            while (currentNode && currentNode.parentId !== null) {
                const parentNode = nodeMap.get(currentNode.parentId);
                if (parentNode) {
                    parentNode.expanded = true;
                    currentNode = parentNode;
                } else {
                    break;
                }
            }
        }
    }

    if (!addRootNode) {
        return rootNode.children;
    }

    return [rootNode, nodeIdExist];
}

function createNode(
    item: HierarchicalItem,
    nodeIdToExpand?: ID,
    nodeIdToRemove?: ID,
    leavesKey?: string
): TreeNode | null {
    if (
        nodeIdToRemove &&
        parseNumber(item.id) === parseNumber(nodeIdToRemove)
    ) {
        return null;
    }

    const node = {
        id: parseNumber(item.id) || null,
        label: item.label || item.name || 'Sem rótulo',
        slug: item.labelSlug || item.nameSlug || null,
        parentId: item.parentId || null,
        expanded: item.id === nodeIdToExpand,
        children: []
    } as TreeNode;

    // @ts-ignore
    if (leavesKey && item[leavesKey]) {
        // @ts-ignore
        for (const leaf of item[leavesKey]) {
            const leafNode = createNode(
                leaf,
                nodeIdToExpand,
                nodeIdToRemove,
                leavesKey
            );

            if (
                nodeIdToRemove &&
                leafNode &&
                parseNumber(leafNode.id) === parseNumber(nodeIdToRemove)
            ) {
                continue;
            }

            node.children.push({
                isLeaf: true,
                ...leaf,
                ...leafNode
            });
        }
    }

    return node;
}