import { store } from '../utils/store.js';
import { TreeNode } from './TreeNode.js';
import { Sidebar } from './Sidebar.js';
import { ContextMenu } from './ContextMenu.js';

export class ViewerTab {
  constructor() {
    this.container = null;
    this.treeNode = null;
    this.sidebar = null;
    this.contextMenu = null;
    this.unsubscribe = null;
  }

  mount(element) {
    this.container = element;
    this.render();
    
    // Subscribe to state changes
    this.unsubscribe = store.subscribe((state) => {
      this.updateView(state);
    });
    
    // Initial render based on current state
    this.updateView(store.getState());
  }

  unmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.treeNode) {
      this.treeNode.unmount();
    }
    if (this.sidebar) {
      this.sidebar.unmount();
    }
    if (this.contextMenu) {
      this.contextMenu.unmount();
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="viewer-container">
        <div class="tree-container" id="tree-view">
          <div class="empty-state">
            <div class="empty-state-icon">{ }</div>
            <div class="empty-state-text">No JSON loaded</div>
            <div class="empty-state-hint">Paste JSON in the Source tab or drop a file</div>
          </div>
        </div>
        <div id="sidebar-container"></div>
      </div>
    `;

    // Setup context menu
    this.contextMenu = new ContextMenu();
    this.contextMenu.mount(document.body);

    // Setup sidebar
    const sidebarContainer = this.container.querySelector('#sidebar-container');
    this.sidebar = new Sidebar();
    this.sidebar.mount(sidebarContainer);
  }

  updateView(state) {
    const treeView = this.container.querySelector('#tree-view');
    
    if (!state.parsedTree) {
      treeView.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">{ }</div>
          <div class="empty-state-text">No JSON loaded</div>
          <div class="empty-state-hint">Paste JSON in the Source tab or drop a file</div>
        </div>
      `;
      return;
    }

    // Render tree
    treeView.innerHTML = '';
    this.treeNode = new TreeNode(state.parsedTree, this.contextMenu);
    this.treeNode.mount(treeView);
  }
}
