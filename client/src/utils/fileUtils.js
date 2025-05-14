export function createFileNode(name, type = 'file') {
  return { name, type, children: type === 'folder' ? [] : null, content: '' };
}

export function addNode(tree, path, node) {
  if (path.length === 0) {
    tree.push(node);
    return;
  }
  const folder = tree.find(item => item.type === 'folder' && item.name === path[0]);
  if (folder) addNode(folder.children, path.slice(1), node);
}
