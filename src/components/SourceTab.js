import { store } from '../utils/store.js';
import { JSONParser } from '../utils/jsonParser.js';
import { TreeBuilder } from '../utils/treeBuilder.js';
import { FileHandler } from '../utils/fileHandler.js';

export class SourceTab {
  constructor() {
    this.container = null;
    this.fileHandler = null;
  }

  mount(element) {
    this.container = element;
    this.render();
    this.setupEventListeners();
    
    // Setup file drag & drop
    this.fileHandler = new FileHandler((content, filename) => {
      const textarea = this.container.querySelector('.json-input');
      const loadingIndicator = this.container.querySelector('.drop-zone-loading');
      
      // Show loading state
      if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
      }
      
      // Use setTimeout to allow UI to update before processing
      setTimeout(() => {
        textarea.value = content;
        this.handleInput(content, true);
        
        // Hide loading state
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
      }, 50);
    });
  }

  unmount() {
    if (this.fileHandler) {
      // Cleanup if needed
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="source-container">
        <div class="drop-zone">
          <div class="drop-zone-text">
            <strong>Drop JSON file here</strong> or paste below
          </div>
          <div class="drop-zone-hint">
            Supports any valid JSON format
          </div>
          <div class="drop-zone-loading" style="display: none; margin-top: var(--spacing-sm);">
            <span class="loading-spinner"></span> Loading...
          </div>
        </div>
        
        <textarea 
          class="json-input" 
          placeholder="Paste your JSON here..."
          spellcheck="false"
        ></textarea>
        
        <div class="toolbar">
          <button class="toolbar-btn" id="btn-prettify">Prettify</button>
          <button class="toolbar-btn" id="btn-minify">Minify</button>
          <div class="toolbar-separator"></div>
          <button class="toolbar-btn" id="btn-clear">Clear</button>
          <div style="flex: 1;"></div>
          <button class="btn primary" id="btn-load">Load to Viewer →</button>
        </div>
        
        <div id="error-display" style="display: none; color: var(--accent-orange); padding: var(--spacing-sm); font-family: var(--font-mono); font-size: 0.85rem;"></div>
      </div>
    `;
  }

  setupEventListeners() {
    const textarea = this.container.querySelector('.json-input');
    const btnPrettify = this.container.querySelector('#btn-prettify');
    const btnMinify = this.container.querySelector('#btn-minify');
    const btnClear = this.container.querySelector('#btn-clear');
    const btnLoad = this.container.querySelector('#btn-load');
    const errorDisplay = this.container.querySelector('#error-display');

    // Input handling with debounce for manual typing
    let debounceTimer;
    textarea.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const content = e.target.value;
      
      // Clear previous state immediately
      if (!content.trim()) {
        store.setJson(null);
        textarea.classList.remove('error');
        errorDisplay.style.display = 'none';
        return;
      }
      
      // Debounce processing for manual input
      debounceTimer = setTimeout(() => {
        const result = JSONParser.parse(content);
        
        if (result.success) {
          textarea.classList.remove('error');
          errorDisplay.style.display = 'none';
          
          // Auto-prettify if minified
          if (content.length > 100 && !content.includes('\n')) {
            const prettified = JSONParser.prettify(content);
            if (prettified !== content) {
              textarea.value = prettified;
            }
          }
          
          store.setJson(result.data);
          const tree = TreeBuilder.build(result.data);
          store.setParsedTree(tree);
        } else {
          textarea.classList.add('error');
          errorDisplay.style.display = 'block';
          errorDisplay.textContent = `Error: ${result.error.message} (Line ${result.error.line}, Column ${result.error.column})`;
          store.setJsonError(result.error);
        }
      }, 300);
    });

    // Prettify
    btnPrettify.addEventListener('click', () => {
      const content = textarea.value;
      if (content.trim()) {
        const prettified = JSONParser.prettify(content);
        textarea.value = prettified;
        this.handleInput(prettified);
      }
    });

    // Minify
    btnMinify.addEventListener('click', () => {
      const content = textarea.value;
      if (content.trim()) {
        const minified = JSONParser.minify(content);
        textarea.value = minified;
      }
    });

    // Clear
    btnClear.addEventListener('click', () => {
      textarea.value = '';
      store.setJson(null);
      textarea.classList.remove('error');
      errorDisplay.style.display = 'none';
    });

    // Load to viewer
    btnLoad.addEventListener('click', () => {
      const content = textarea.value;
      if (content.trim()) {
        const result = JSONParser.parse(content);
        if (result.success) {
          store.setJson(result.data);
          const tree = TreeBuilder.build(result.data);
          store.setParsedTree(tree);
          store.setTab('viewer');
        }
      }
    });
  }

  handleInput(content, isFileDrop = false) {
    const textarea = this.container.querySelector('.json-input');
    const errorDisplay = this.container.querySelector('#error-display');

    if (!content.trim()) {
      textarea.classList.remove('error');
      errorDisplay.style.display = 'none';
      return;
    }

    const processContent = () => {
      const result = JSONParser.parse(content);
      
      if (result.success) {
        textarea.classList.remove('error');
        errorDisplay.style.display = 'none';
        
        store.setJson(result.data);
        
        // Build tree asynchronously for large files
        if (isFileDrop && content.length > 100000) {
          setTimeout(() => {
            const tree = TreeBuilder.build(result.data);
            store.setParsedTree(tree);
          }, 10);
        } else {
          const tree = TreeBuilder.build(result.data);
          store.setParsedTree(tree);
        }
      } else {
        textarea.classList.add('error');
        errorDisplay.style.display = 'block';
        errorDisplay.textContent = `Error: ${result.error.message} (Line ${result.error.line}, Column ${result.error.column})`;
        store.setJsonError(result.error);
      }
    };

    processContent();
  }
}
