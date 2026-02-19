import { store } from '../utils/store.js';
import { Clipboard } from '../utils/clipboard.js';
import { JSONParser } from '../utils/jsonParser.js';

export class ContextMenu {
  constructor() {
    this.element = null;
    this.currentNode = null;
    this.hideHandler = this.hide.bind(this);
  }

  mount(parent) {
    this.element = document.createElement('div');
    this.element.className = 'context-menu';
    this.element.style.display = 'none';
    parent.appendChild(this.element);

    // Hide on click outside
    document.addEventListener('click', this.hideHandler);
    document.addEventListener('scroll', this.hideHandler, true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });
  }

  unmount() {
    document.removeEventListener('click', this.hideHandler);
    document.removeEventListener('scroll', this.hideHandler, true);
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  show(x, y, node) {
    this.currentNode = node;
    this.element.innerHTML = this.renderMenu();
    this.element.style.display = 'block';
    
    // Position menu
    const rect = this.element.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let left = x;
    let top = y;
    
    // Adjust if menu goes off screen
    if (left + rect.width > windowWidth) {
      left = windowWidth - rect.width - 10;
    }
    if (top + rect.height > windowHeight) {
      top = windowHeight - rect.height - 10;
    }
    
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;

    // Setup click handlers
    this.setupHandlers();
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
    this.currentNode = null;
  }

  renderMenu() {
    const isExpandable = this.currentNode.type === 'object' || this.currentNode.type === 'array';
    
    let html = `
      <div class="context-menu-item" data-action="copy-key">
        Copy Key
      </div>
    `;

    if (!isExpandable) {
      html += `
        <div class="context-menu-item" data-action="copy-value">
          Copy Value
        </div>
        <div class="context-menu-item" data-action="copy-key-value">
          Copy "key": value
        </div>
      `;
    } else {
      html += `
        <div class="context-menu-item" data-action="copy-json">
          Copy as JSON
        </div>
      `;
    }

    html += `
      <div class="context-menu-item" data-action="copy-path">
        Copy Path
      </div>
    `;

    if (isExpandable) {
      const isExpanded = store.getState().expandedPaths.has(this.currentNode.id);
      html += `
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" data-action="expand-all">
          Expand All
        </div>
        <div class="context-menu-item" data-action="collapse-all">
          Collapse All
        </div>
      `;
    }

    return html;
  }

  setupHandlers() {
    this.element.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleAction(action);
        this.hide();
      });
    });
  }

  handleAction(action) {
    if (!this.currentNode) return;

    switch (action) {
      case 'copy-key':
        Clipboard.copyWithNotification(
          String(this.currentNode.key),
          'Key copied to clipboard'
        );
        break;

      case 'copy-value':
        Clipboard.copyWithNotification(
          String(this.currentNode.value),
          'Value copied to clipboard'
        );
        break;

      case 'copy-key-value':
        const formatted = `"${this.currentNode.key}": ${JSONParser.formatValue(this.currentNode.value, this.currentNode.type)}`;
        Clipboard.copyWithNotification(
          formatted,
          'Key-value pair copied'
        );
        break;

      case 'copy-path':
        Clipboard.copyWithNotification(
          this.currentNode.getFullPath(),
          'Path copied to clipboard'
        );
        break;

      case 'copy-json':
        const json = JSON.stringify(this.currentNode.value, null, 2);
        Clipboard.copyWithNotification(
          json,
          'JSON copied to clipboard'
        );
        break;

      case 'expand-all':
        this.expandAll(this.currentNode);
        Clipboard.showToast('All children expanded');
        break;

      case 'collapse-all':
        this.collapseAll(this.currentNode);
        Clipboard.showToast('All children collapsed');
        break;
    }
  }

  expandAll(node) {
    const expand = (n) => {
      if (n.type === 'object' || n.type === 'array') {
        store.expandPath(n.id);
        n.children.forEach(expand);
      }
    };
    expand(node);
  }

  collapseAll(node) {
    const collapse = (n) => {
      if (n.type === 'object' || n.type === 'array') {
        store.collapsePath(n.id);
        n.children.forEach(collapse);
      }
    };
    collapse(node);
  }
}
