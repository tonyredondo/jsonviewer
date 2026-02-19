import { store } from '../utils/store.js';
import { JSONParser } from '../utils/jsonParser.js';

export class Sidebar {
  constructor() {
    this.container = null;
    this.unsubscribe = null;
    this.isResizing = false;
    this.startX = 0;
    this.startWidth = 0;
  }

  mount(element) {
    this.container = element;
    this.render();
    this.setupResizeHandle();
    
    // Subscribe to state changes
    this.unsubscribe = store.subscribe((state) => {
      this.updateVisibility(state);
      this.updateContent(state);
    });

    // Initial state
    const state = store.getState();
    this.updateVisibility(state);
    this.updateContent(state);
  }

  unmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.removeResizeListeners();
  }

  render() {
    this.container.className = 'sidebar';
    this.container.innerHTML = `
      <div class="sidebar-resize-handle"></div>
      <div class="sidebar-header">
        <span class="sidebar-title">Node Details</span>
        <button class="sidebar-close" title="Close">×</button>
      </div>
      <div class="sidebar-content">
        <div class="property-grid" id="property-grid">
          <!-- Properties will be inserted here -->
        </div>
      </div>
    `;

    // Close button
    const closeBtn = this.container.querySelector('.sidebar-close');
    closeBtn.addEventListener('click', () => {
      store.setState({ sidebarOpen: false, selectedNode: null });
    });
  }

  setupResizeHandle() {
    const handle = this.container.querySelector('.sidebar-resize-handle');
    
    handle.addEventListener('mousedown', (e) => {
      this.isResizing = true;
      this.startX = e.clientX;
      this.startWidth = this.container.offsetWidth;
      
      handle.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      // Add global listeners
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    });

    this.handleMouseMove = (e) => {
      if (!this.isResizing) return;
      
      const delta = this.startX - e.clientX;
      const newWidth = Math.max(250, this.startWidth + delta);
      
      this.container.style.width = `${newWidth}px`;
    };

    this.handleMouseUp = () => {
      this.isResizing = false;
      handle.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      this.removeResizeListeners();
    };
  }

  removeResizeListeners() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  updateVisibility(state) {
    if (state.sidebarOpen && state.selectedNode) {
      this.container.classList.remove('collapsed');
    } else {
      this.container.classList.add('collapsed');
    }
  }

  updateContent(state) {
    const grid = this.container.querySelector('#property-grid');
    const title = this.container.querySelector('.sidebar-title');

    if (!state.selectedNode) {
      grid.innerHTML = '<div class="property-label">Select a node to view details</div>';
      return;
    }

    const node = state.selectedNode;
    title.textContent = `Node: ${node.key !== null ? node.key : 'Root'}`;

    const properties = this.getNodeProperties(node);
    grid.innerHTML = properties.map(prop => this.renderProperty(prop)).join('');

    // Make values selectable
    grid.querySelectorAll('.property-value').forEach(el => {
      el.addEventListener('click', () => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      });
    });
  }

  getNodeProperties(node) {
    const props = [
      { label: 'Key', value: node.key !== null ? String(node.key) : '(root)', type: 'string' }
    ];

    if (node.type === 'object' || node.type === 'array') {
      props.push(
        { label: 'Type', value: node.type, type: 'string' },
        { label: 'Size', value: `${node.size} items`, type: 'number' }
      );
      
      // Show first few keys/indices for objects/arrays
      if (node.children.length > 0) {
        const childrenPreview = node.children.slice(0, 5).map(c => c.key).join(', ');
        const more = node.children.length > 5 ? ` (+${node.children.length - 5} more)` : '';
        props.push({ 
          label: 'Keys', 
          value: childrenPreview + more, 
          type: 'string',
          multiline: node.children.length > 3
        });
      }
    } else {
      props.push(
        { label: 'Type', value: node.type, type: 'string' },
        { 
          label: 'Value', 
          value: JSONParser.formatValue(node.value, node.type), 
          type: node.type,
          multiline: node.type === 'string' && String(node.value).length > 50
        }
      );

      if (node.type === 'string') {
        props.push({ label: 'Length', value: `${node.value.length} chars`, type: 'number' });
      }
    }

    // Path
    const path = node.getFullPath();
    if (path) {
      props.push({ label: 'Path', value: path, type: 'string' });
    }

    return props;
  }

  renderProperty(prop) {
    const valueClass = `property-value ${prop.type || ''} ${prop.multiline ? 'multiline' : ''}`;
    const value = prop.multiline ? prop.value : this.escapeHtml(String(prop.value));
    
    return `
      <div class="property-label">${this.escapeHtml(prop.label)}</div>
      <div class="${valueClass}">${value}</div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
