export const useConvertToTreeData = (
  categories: Category[], 
  hasSingleRoot: boolean = true,
  hasLeafs: boolean = false,
  exclude: number | null = null,
  openNodeId: number | string | null = null
) => {
  const treeData = {
    id: "root",
    label: "Root",
    children: []
  };

  const findNode = (id: string | number, node: any): any => {
    if (node.id === id) {
      return node;
    }

    for (const child of node.children) {
      const result = findNode(id, child);
      if (result) {
        return result;
      }
    }

    return null;
  };

  const createNode = (
    id: string | number,
    label: string,
    parentId: string | number | null | undefined,
    entries: Entry[] | undefined
  ) => {

    if (findNode(id, treeData)) {
      return;
    }

    const treeItem = {
      id,
      label,
      parentId,
      isOpen: id === openNodeId,
      children: []
    };

    if (parentId === null) {
      treeData.children.push(treeItem);
    } else {
      let parentTreeItem = findNode(parentId, treeData);

      if (!parentTreeItem) {
        const parentCategory = categories.find((c) => c.id == parentId);

        if (parentCategory) {
          createNode(
            parentCategory.id,
            parentCategory.name,
            parentCategory.parentId,
            parentCategory.entries
          );
          parentTreeItem = findNode(parentId, treeData);
        }
      }

      if (parentTreeItem) {
        parentTreeItem.children.push(treeItem);

        if (id === openNodeId) {
          let currentNode = parentTreeItem;
          while (currentNode) {
            currentNode.isOpen = true;
            currentNode = findNode(currentNode.parentId, treeData);
          }
        }
      }
    }

    if (hasLeafs) {
      entries.forEach((entry) => {
        const entryNode = {
          id: entry.id,
          label: entry.name,
          link: `/verbetes/${entry.nameSlug}`,
          children: []
        };
        treeItem.children.push(entryNode);

        if (entry.id == openNodeId) {
          treeItem.isOpen = true;
          let currentNode = findNode(treeItem.parentId, treeData);
          while (currentNode) {
            currentNode.isOpen = true;
            currentNode = findNode(currentNode.parentId, treeData);
          }
        }
      });
    }
  };

  categories.forEach((category) => {
    createNode(category.id, category.name, category.parentId, category.entries);
  });

  if (exclude) {
    const excludeNode = findNode(exclude, treeData);
    if (excludeNode) {
      excludeNode.children = [];
    }
  }

  if (hasSingleRoot) {
    return treeData;
  }

  return treeData.children;
};
