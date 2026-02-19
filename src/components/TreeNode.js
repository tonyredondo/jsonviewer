import { store } from '../utils/store.js';
import { JSONParser } from '../utils/jsonParser.js';

export class TreeNode {
  constructor(node, contextMenu, level = 0) {
    this.node = node;
    this.contextMenu = contextMenu;
    this.level = level;
    this.element = null;
    this.childrenContainer = null;
    this.unsubscribe = null;
  }

  mount(parent) {
    this.element = document.createElement('div');
    this.element.className = 'tree-node';
    this.element.style.marginLeft = this.level > 0 ? '8px' : '0';

    this.render();
    parent.appendChild(this.element);

    // Subscribe to state changes for selection
    this.unsubscribe = store.subscribe((state) => {
      this.updateSelection(state);
      this.updateExpansion(state);
    });
  }

  unmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const isExpandable = this.node.type === 'object' || this.node.type === 'array';
    const isExpanded = store.getState().expandedPaths.has(this.node.id);
    
    // Node content
    const content = document.createElement('div');
    content.className = 'tree-node-content';
    content.dataset.nodeId = this.node.id;

    // Toggle button for expandable nodes
    if (isExpandable) {
      const toggle = document.createElement('span');
      toggle.className = `tree-toggle ${isExpanded ? 'expanded' : ''}`;
      toggle.innerHTML = '▶';
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        store.togglePath(this.node.id);
      });
      content.appendChild(toggle);
    } else {
      // Spacer for alignment
      const spacer = document.createElement('span');
      spacer.style.width = '16px';
      content.appendChild(spacer);
    }

    // Key
    if (this.node.key !== null && this.node.key !== undefined) {
      const keySpan = document.createElement('span');
      keySpan.className = 'tree-key';
      keySpan.textContent = typeof this.node.key === 'number' ? `[${this.node.key}]` : `"${this.node.key}"`;
      content.appendChild(keySpan);

      // Separator
      const separator = document.createElement('span');
      separator.className = 'tree-separator';
      separator.textContent = ': ';
      content.appendChild(separator);
    }

    // Value or bracket
    if (isExpandable) {
      const bracket = document.createElement('span');
      bracket.className = 'tree-bracket';
      
      if (!isExpanded) {
        const openBracket = this.node.type === 'object' ? '{' : '[';
        const closeBracket = this.node.type === 'object' ? '}' : ']';
        bracket.textContent = `${openBracket}${this.node.size}${closeBracket}`;
      } else {
        bracket.textContent = this.node.type === 'object' ? '{' : '[';
      }
      
      content.appendChild(bracket);

      // Count indicator when expanded
      if (isExpanded) {
        const count = document.createElement('span');
        count.className = 'tree-count';
        count.textContent = `${this.node.size} items`;
        content.appendChild(count);
      }
    } else {
      const value = document.createElement('span');
      value.className = `tree-value ${this.node.type}`;
      // Escape newlines to show as literal \n in tree view
      let displayValue = JSONParser.formatValue(this.node.value, this.node.type);
      if (this.node.type === 'string') {
        displayValue = displayValue.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
      }
      value.textContent = displayValue;
      content.appendChild(value);
    }

    // Click handler for selection
    content.addEventListener('click', (e) => {
      e.stopPropagation();
      store.selectNode(this.node);
    });

    // Context menu
    content.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.contextMenu.show(e.clientX, e.clientY, this.node);
    });

    this.element.appendChild(content);

    // Children container
    if (isExpandable && isExpanded) {
      this.childrenContainer = document.createElement('div');
      this.childrenContainer.className = 'tree-children';
      
      this.node.children.forEach(child => {
        const childNode = new TreeNode(child, this.contextMenu, this.level + 1);
        childNode.mount(this.childrenContainer);
      });

      this.element.appendChild(this.childrenContainer);

      // Closing bracket
      const closingContent = document.createElement('div');
      closingContent.className = 'tree-node-content';
      closingContent.style.paddingLeft = '8px';
      
      const closingBracket = document.createElement('span');
      closingBracket.className = 'tree-bracket';
      closingBracket.textContent = this.node.type === 'object' ? '}' : ']';
      closingContent.appendChild(closingBracket);

      closingContent.addEventListener('click', (e) => {
        e.stopPropagation();
        store.togglePath(this.node.id);
      });

      this.element.appendChild(closingContent);
    }
  }

  updateSelection(state) {
    const content = this.element.querySelector('.tree-node-content');
    if (state.selectedNode && state.selectedNode.id === this.node.id) {
      content.classList.add('selected');
    } else {
      content.classList.remove('selected');
    }
  }

  updateExpansion(state) {
    const isExpandable = this.node.type === 'object' || this.node.type === 'array';
    if (!isExpandable) return;

    const isExpanded = state.expandedPaths.has(this.node.id);
    const toggle = this.element.querySelector('.tree-toggle');
    
    if (toggle) {
      toggle.classList.toggle('expanded', isExpanded);
    }

    // Re-render if expansion state changed significantly
    const hasChildren = this.element.querySelector('.tree-children') !== null;
    if (isExpanded !== hasChildren) {
      // Remove all children and re-render
      while (this.element.children.length > 1) {
        this.element.removeChild(this.element.lastChild);
      }
      this.renderChildren(isExpanded);
    }
  }

  renderChildren(isExpanded) {
    if (!isExpanded) return;

    this.childrenContainer = document.createElement('div');
    this.childrenContainer.className = 'tree-children';
    
    this.node.children.forEach(child => {
      const childNode = new TreeNode(child, this.contextMenu, this.level + 1);
      childNode.mount(this.childrenContainer);
    });

    this.element.appendChild(this.childrenContainer);

    // Closing bracket
    const closingContent = document.createElement('div');
    closingContent.className = 'tree-node-content';
    closingContent.style.paddingLeft = '20px';
    
    const closingBracket = document.createElement('span');
    closingBracket.className = 'tree-bracket';
    closingBracket.textContent = this.node.type === 'object' ? '}' : ']';
    closingContent.appendChild(closingBracket);

    closingContent.addEventListener('click', (e) => {
      e.stopPropagation();
      store.togglePath(this.node.id);
    });

    this.element.appendChild(closingContent);
  }
}
