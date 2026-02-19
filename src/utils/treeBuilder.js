import { JSONParser } from './jsonParser.js';

let idCounter = 0;

export class TreeNode {
  constructor({ key, value, type, depth = 0, parent = null }) {
    this.id = `node-${++idCounter}`;
    this.key = key;
    this.value = value;
    this.type = type;
    this.depth = depth;
    this.parent = parent;
    this.children = [];
    this.expanded = false;
    this.size = JSONParser.getSize(value);
  }

  getPath() {
    const parts = [];
    let current = this;
    while (current) {
      if (current.key !== undefined && current.key !== null) {
        parts.unshift(current.key);
      }
      current = current.parent;
    }
    return parts.join('.');
  }

  getFullPath() {
    const parts = [];
    let current = this;
    while (current) {
      if (current.key !== undefined && current.key !== null) {
        parts.unshift(current.key);
      }
      current = current.parent;
    }
    return parts.map((part, index) => {
      if (typeof part === 'number') {
        return `[${part}]`;
      }
      return index === 0 ? part : `.${part}`;
    }).join('').replace(/\.\[/g, '[');
  }

  expand() {
    this.expanded = true;
  }

  collapse() {
    this.expanded = false;
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  expandAll() {
    this.expanded = true;
    this.children.forEach(child => child.expandAll());
  }

  collapseAll() {
    this.expanded = false;
    this.children.forEach(child => child.collapseAll());
  }
}

export class TreeBuilder {
  static build(json) {
    idCounter = 0;
    return this.buildNode(null, json, 0, null);
  }

  static buildNode(key, value, depth, parent) {
    const type = JSONParser.getType(value);
    const node = new TreeNode({ key, value, type, depth, parent });

    if (type === 'object') {
      Object.entries(value).forEach(([childKey, childValue]) => {
        const child = this.buildNode(childKey, childValue, depth + 1, node);
        node.children.push(child);
      });
    } else if (type === 'array') {
      value.forEach((item, index) => {
        const child = this.buildNode(index, item, depth + 1, node);
        node.children.push(child);
      });
    }

    return node;
  }

  static findNode(root, nodeId) {
    if (root.id === nodeId) return root;
    
    for (const child of root.children) {
      const found = this.findNode(child, nodeId);
      if (found) return found;
    }
    
    return null;
  }

  static getAllNodes(root) {
    const nodes = [root];
    root.children.forEach(child => {
      nodes.push(...this.getAllNodes(child));
    });
    return nodes;
  }

  static search(root, query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    const searchNode = (node) => {
      const keyMatch = String(node.key).toLowerCase().includes(lowerQuery);
      const valueMatch = node.type !== 'object' && node.type !== 'array' && 
                        String(node.value).toLowerCase().includes(lowerQuery);

      if (keyMatch || valueMatch) {
        results.push(node);
      }

      node.children.forEach(searchNode);
    };

    searchNode(root);
    return results;
  }
}
