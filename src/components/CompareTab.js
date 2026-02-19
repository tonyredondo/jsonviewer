import { store } from '../utils/store.js';
import { JSONParser } from '../utils/jsonParser.js';

export class CompareTab {
  constructor() {
    this.container = null;
    this.jsonA = null;
    this.jsonB = null;
  }

  mount(element) {
    this.container = element;
    this.render();
    this.setupEventListeners();
  }

  unmount() {
    // Cleanup
  }

  render() {
    this.container.innerHTML = `
      <div class="compare-container">
        <div class="compare-inputs">
          <div class="compare-panel">
            <div class="compare-header">
              <span class="compare-label">JSON A</span>
              <span class="compare-status" id="status-a"></span>
            </div>
            <textarea 
              class="compare-textarea" 
              id="json-a"
              placeholder="Paste first JSON here..."
              spellcheck="false"
            ></textarea>
          </div>
          
          <div class="compare-panel">
            <div class="compare-header">
              <span class="compare-label">JSON B</span>
              <span class="compare-status" id="status-b"></span>
            </div>
            <textarea 
              class="compare-textarea" 
              id="json-b"
              placeholder="Paste second JSON here..."
              spellcheck="false"
            ></textarea>
          </div>
        </div>
        
        <div class="compare-toolbar">
          <button class="btn primary" id="btn-compare">Compare JSONs</button>
          <button class="toolbar-btn" id="btn-clear-compare">Clear</button>
          <div style="flex: 1;"></div>
          <div class="compare-legend">
            <span class="legend-item added">Added</span>
            <span class="legend-item removed">Removed</span>
            <span class="legend-item modified">Modified</span>
          </div>
        </div>
        
        <div class="compare-results" id="compare-results">
          <div class="empty-state">
            <div class="empty-state-icon">⇄</div>
            <div class="empty-state-text">Compare two JSONs</div>
            <div class="empty-state-hint">Paste JSON A and JSON B, then click Compare</div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const textareaA = this.container.querySelector('#json-a');
    const textareaB = this.container.querySelector('#json-b');
    const btnCompare = this.container.querySelector('#btn-compare');
    const btnClear = this.container.querySelector('#btn-clear-compare');
    const statusA = this.container.querySelector('#status-a');
    const statusB = this.container.querySelector('#status-b');

    // Auto-validate on input
    const validate = (textarea, status) => {
      const content = textarea.value.trim();
      if (!content) {
        status.textContent = '';
        status.className = 'compare-status';
        return null;
      }
      
      const result = JSONParser.parse(content);
      if (result.success) {
        status.textContent = '✓ Valid';
        status.className = 'compare-status valid';
        return result.data;
      } else {
        status.textContent = '✗ Invalid';
        status.className = 'compare-status invalid';
        return null;
      }
    };

    textareaA.addEventListener('input', () => {
      this.jsonA = validate(textareaA, statusA);
    });

    textareaB.addEventListener('input', () => {
      this.jsonB = validate(textareaB, statusB);
    });

    btnCompare.addEventListener('click', () => {
      this.jsonA = validate(textareaA, statusA);
      this.jsonB = validate(textareaB, statusB);
      
      if (this.jsonA && this.jsonB) {
        this.performCompare();
      } else {
        this.showError('Please enter valid JSON in both fields');
      }
    });

    btnClear.addEventListener('click', () => {
      textareaA.value = '';
      textareaB.value = '';
      statusA.textContent = '';
      statusB.textContent = '';
      this.jsonA = null;
      this.jsonB = null;
      this.renderEmptyState();
    });
  }

  performCompare() {
    const diff = this.compareObjects(this.jsonA, this.jsonB, '');
    this.renderDiff(diff);
  }

  compareObjects(a, b, path) {
    const differences = [];
    const typeA = this.getType(a);
    const typeB = this.getType(b);

    // Type mismatch
    if (typeA !== typeB) {
      differences.push({
        path,
        type: 'modified',
        oldValue: a,
        newValue: b,
        oldType: typeA,
        newType: typeB
      });
      return differences;
    }

    // Compare based on type
    if (typeA === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      const allKeys = new Set([...keysA, ...keysB]);

      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        
        if (!(key in a)) {
          differences.push({
            path: newPath,
            type: 'added',
            value: b[key],
            valueType: this.getType(b[key])
          });
        } else if (!(key in b)) {
          differences.push({
            path: newPath,
            type: 'removed',
            value: a[key],
            valueType: this.getType(a[key])
          });
        } else {
          differences.push(...this.compareObjects(a[key], b[key], newPath));
        }
      }
    } else if (typeA === 'array') {
      const maxLen = Math.max(a.length, b.length);
      
      for (let i = 0; i < maxLen; i++) {
        const newPath = `${path}[${i}]`;
        
        if (i >= a.length) {
          differences.push({
            path: newPath,
            type: 'added',
            value: b[i],
            valueType: this.getType(b[i])
          });
        } else if (i >= b.length) {
          differences.push({
            path: newPath,
            type: 'removed',
            value: a[i],
            valueType: this.getType(a[i])
          });
        } else {
          differences.push(...this.compareObjects(a[i], b[i], newPath));
        }
      }
    } else {
      // Primitive comparison
      if (a !== b) {
        differences.push({
          path,
          type: 'modified',
          oldValue: a,
          newValue: b,
          oldType: typeA,
          newType: typeB
        });
      }
    }

    return differences;
  }

  getType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  renderDiff(differences) {
    const container = this.container.querySelector('#compare-results');
    
    if (differences.length === 0) {
      container.innerHTML = `
        <div class="compare-no-diff">
          <div class="compare-no-diff-icon">✓</div>
          <div class="compare-no-diff-text">No differences found!</div>
          <div class="compare-no-diff-hint">Both JSONs are identical</div>
        </div>
      `;
      return;
    }

    // Group by type
    const added = differences.filter(d => d.type === 'added');
    const removed = differences.filter(d => d.type === 'removed');
    const modified = differences.filter(d => d.type === 'modified');

    let html = '<div class="compare-diff-list">';
    
    // Summary
    html += `
      <div class="compare-summary">
        <span class="summary-item added">${added.length} added</span>
        <span class="summary-item removed">${removed.length} removed</span>
        <span class="summary-item modified">${modified.length} modified</span>
        <span class="summary-item total">${differences.length} total</span>
      </div>
    `;

    // Differences
    differences.forEach(diff => {
      html += this.renderDiffItem(diff);
    });

    html += '</div>';
    container.innerHTML = html;
  }

  renderDiffItem(diff) {
    let content = '';
    
    switch (diff.type) {
      case 'added':
        content = `
          <div class="diff-path">${diff.path}</div>
          <div class="diff-content">
            <span class="diff-label">Added:</span>
            <span class="diff-value">${this.formatValue(diff.value)}</span>
          </div>
        `;
        break;
        
      case 'removed':
        content = `
          <div class="diff-path">${diff.path}</div>
          <div class="diff-content">
            <span class="diff-label">Removed:</span>
            <span class="diff-value">${this.formatValue(diff.value)}</span>
          </div>
        `;
        break;
        
      case 'modified':
        content = `
          <div class="diff-path">${diff.path}</div>
          <div class="diff-content">
            <div class="diff-row">
              <span class="diff-label">Old:</span>
              <span class="diff-value old">${this.formatValue(diff.oldValue)}</span>
            </div>
            <div class="diff-row">
              <span class="diff-label">New:</span>
              <span class="diff-value new">${this.formatValue(diff.newValue)}</span>
            </div>
          </div>
        `;
        break;
    }

    return `
      <div class="diff-item ${diff.type}">
        ${content}
      </div>
    `;
  }

  formatValue(value) {
    const type = this.getType(value);
    if (type === 'object' || type === 'array') {
      return JSON.stringify(value);
    }
    return JSONParser.formatValue(value, type);
  }

  showError(message) {
    const container = this.container.querySelector('#compare-results');
    container.innerHTML = `
      <div class="compare-error">
        <div class="compare-error-icon">⚠</div>
        <div class="compare-error-text">${message}</div>
      </div>
    `;
  }

  renderEmptyState() {
    const container = this.container.querySelector('#compare-results');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⇄</div>
        <div class="empty-state-text">Compare two JSONs</div>
        <div class="empty-state-hint">Paste JSON A and JSON B, then click Compare</div>
      </div>
    `;
  }
}
