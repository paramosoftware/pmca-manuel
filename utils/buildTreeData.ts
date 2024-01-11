
import parseNumber from "./parseNumber";

export function buildTreeData(
  hierarchalItems: HierarchicalItem[], 
  addRootNode: boolean = true,
  nodeIdToExpand?: ID, 
  nodeIdToRemove?: ID, 
  leavesKey?: string // when the leaves are in a different key
): TreeNode[] 
{

  const nodeMap = new Map<ID, TreeNode>();
  const rootNodes: TreeNode[] = [];

  const rootNode = createNode({ id: 'root', name: 'Root', parentId: null, children: [] });

  if (!rootNode) {
      return [];
  }

  rootNodes.push(rootNode);

  for (const item of hierarchalItems) {

      let currentNode = nodeMap.get(item.id);
      let tempNode = createNode(item, nodeIdToExpand, nodeIdToRemove, leavesKey);

      if (!tempNode) { continue; }

      if (currentNode) {
          currentNode = tempNode;
      } else {
          currentNode = tempNode;
          nodeMap.set(item.id, currentNode);
      }

      if (!currentNode) { continue; }

      if (item.parentId === null) {
          currentNode.parentId = rootNode.id;
          rootNode.children.push(currentNode);
      } else {

          let parentNode = nodeMap.get(item.parentId);
          let tempNode = createNode(item, nodeIdToExpand, nodeIdToRemove, leavesKey);

          if (!tempNode) { continue; }
          
          if (!parentNode) {
              parentNode = tempNode;
              nodeMap.set(item.parentId, parentNode);
          }

          parentNode.children.push(currentNode);
          currentNode.parentId = parentNode.id;
      }
  }

  if (!addRootNode) {
      return rootNodes[0].children;
  }

  return rootNodes;
}


function createNode(
  item: HierarchicalItem,
  nodeIdToExpand?: ID,
  nodeIdToRemove?: ID,
  leavesKey?: string,
): TreeNode | null {

  if (nodeIdToRemove && parseNumber(item.id) === parseNumber(nodeIdToRemove)) {
      return null;
  }

  const node = {
      id: parseNumber(item.id) || null,
      label: item.label || item.name || 'Sem rótulo',
      slug: item.labelSlug || item.nameSlug || null,
      parentId: item.parentId || null,
      expanded: item.id === nodeIdToExpand,
      children: [],
  } as TreeNode;

  // @ts-ignore
  if (leavesKey && item[leavesKey]) {
      // @ts-ignore
      for (const leaf of item[leavesKey]) {

          const leafNode = createNode(leaf, nodeIdToExpand, nodeIdToRemove, leavesKey);

          if (nodeIdToRemove && leafNode && parseNumber(leafNode.id) === parseNumber(nodeIdToRemove)) {
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