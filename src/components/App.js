import { store } from '../utils/store.js';
import { SourceTab } from './SourceTab.js';
import { ViewerTab } from './ViewerTab.js';
import { CompareTab } from './CompareTab.js';

export class App {
  constructor() {
    this.container = null;
    this.unsubscribe = null;
  }

  mount(element) {
    this.container = element;
    this.render();
    
    // Subscribe to state changes
    this.unsubscribe = store.subscribe(() => {
      this.updateTabs();
    });
  }

  unmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    this.container.innerHTML = `
      <header class="app-header">
        <div class="app-logo">JSON Viewer</div>
        <div class="app-controls">
          <button class="toolbar-btn" id="theme-toggle">Theme</button>
        </div>
      </header>
      
      <nav class="tabs-container">
        <button class="tab active" data-tab="source">Source</button>
        <button class="tab" data-tab="viewer">Viewer</button>
        <button class="tab" data-tab="compare">Compare</button>
      </nav>
      
      <main class="main-content">
        <div class="tab-panel active" id="tab-source"></div>
        <div class="tab-panel" id="tab-viewer"></div>
        <div class="tab-panel" id="tab-compare"></div>
      </main>
    `;

    // Setup tab switching
    this.setupTabs();
    
    // Setup theme toggle
    this.setupThemeToggle();
    
    // Apply initial theme
    this.applyTheme(store.getState().theme);
    
    // Mount child components
    const sourcePanel = this.container.querySelector('#tab-source');
    const viewerPanel = this.container.querySelector('#tab-viewer');
    const comparePanel = this.container.querySelector('#tab-compare');
    
    this.sourceTab = new SourceTab();
    this.viewerTab = new ViewerTab();
    this.compareTab = new CompareTab();
    
    this.sourceTab.mount(sourcePanel);
    this.viewerTab.mount(viewerPanel);
    this.compareTab.mount(comparePanel);
  }

  setupThemeToggle() {
    const themeBtn = this.container.querySelector('#theme-toggle');
    themeBtn.addEventListener('click', () => {
      store.toggleTheme();
    });
    
    // Subscribe to theme changes
    store.subscribe((state) => {
      this.applyTheme(state.theme);
    });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = this.container.querySelector('#theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
    }
  }

  setupTabs() {
    const tabs = this.container.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        store.setTab(tabName);
      });
    });
  }

  updateTabs() {
    const state = store.getState();
    const tabs = this.container.querySelectorAll('.tab');
    const panels = this.container.querySelectorAll('.tab-panel');
    
    tabs.forEach(tab => {
      const tabName = tab.dataset.tab;
      if (tabName === state.currentTab) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    panels.forEach(panel => {
      const panelId = panel.id.replace('tab-', '');
      if (panelId === state.currentTab) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  }
}
