// Simple state management
class Store {
  constructor() {
    this.state = {
      json: null,
      parsedTree: null,
      selectedNode: null,
      currentTab: 'source',
      sidebarOpen: false,
      searchQuery: '',
      searchResults: [],
      expandedPaths: new Set(),
      dragOver: false,
      jsonError: null,
      theme: localStorage.getItem('jsonviewer-theme') || 'dark'
    };
    this.listeners = [];
  }

  getState() {
    return { ...this.state };
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Actions
  setJson(json) {
    this.setState({ 
      json, 
      jsonError: null,
      selectedNode: null,
      expandedPaths: new Set()
    });
  }

  setParsedTree(tree) {
    // Auto-expand root and its first level children
    const expanded = new Set();
    if (tree) {
      expanded.add(tree.id); // Expand root
      if (tree.children) {
        tree.children.forEach(child => {
          expanded.add(child.id); // Expand first level
        });
      }
    }
    this.setState({ parsedTree: tree, expandedPaths: expanded });
  }

  selectNode(node) {
    this.setState({ 
      selectedNode: node,
      sidebarOpen: true
    });
  }

  toggleSidebar() {
    this.setState({ sidebarOpen: !this.state.sidebarOpen });
  }

  setTab(tab) {
    this.setState({ currentTab: tab });
  }

  setDragOver(isOver) {
    this.setState({ dragOver: isOver });
  }

  setJsonError(error) {
    this.setState({ jsonError: error });
  }

  togglePath(path) {
    const expanded = new Set(this.state.expandedPaths);
    if (expanded.has(path)) {
      expanded.delete(path);
    } else {
      expanded.add(path);
    }
    this.setState({ expandedPaths: expanded });
  }

  expandPath(path) {
    const expanded = new Set(this.state.expandedPaths);
    expanded.add(path);
    this.setState({ expandedPaths: expanded });
  }

  collapsePath(path) {
    const expanded = new Set(this.state.expandedPaths);
    expanded.delete(path);
    this.setState({ expandedPaths: expanded });
  }

  toggleTheme() {
    const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('jsonviewer-theme', newTheme);
    this.setState({ theme: newTheme });
  }
}

export const store = new Store();
