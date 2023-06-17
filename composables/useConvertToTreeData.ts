export const useConvertToTreeData = (categories: Category[], exclude: number | null = null) => {
  const treeData = {
    id: "root",
    label: "Root",
    children: []
  };

  const findNode = (id: string, node: any): any => {
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

  const createNode = (id: string, label: string, parentId: string | null) => {

    if (findNode(id, treeData)) {
      return;
    }

    const treeItem = {
      id,
      label,
      children: []
    };

    if (parentId === null) {
      treeData.children.push(treeItem);
    } else {
      let parentTreeItem = findNode(parentId, treeData);

      if (!parentTreeItem) {
        const parentCategory = categories.find((c) => c.id === parentId);

        if (parentCategory) {
          createNode(parentCategory.id, parentCategory.name, parentCategory.parentId);
          parentTreeItem = findNode(parentId, treeData);
        }
      }

      if (parentTreeItem) {
        parentTreeItem.children.push(treeItem);
      }
    }
  };

  categories.forEach((category) => {
    createNode(category.id, category.name, category.parentId);
  });


  if (exclude) {
    const excludeNode = findNode(exclude, treeData);
    if (excludeNode) {
      excludeNode.children = [];
    }
  }


  return treeData;
};
