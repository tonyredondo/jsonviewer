export class FileHandler {
  constructor(onFileLoad) {
    this.onFileLoad = onFileLoad;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.body.addEventListener(eventName, this.preventDefaults, false);
    });

    // Highlight drop zone on drag
    document.body.addEventListener('dragenter', this.handleDragEnter.bind(this), false);
    document.body.addEventListener('dragleave', this.handleDragLeave.bind(this), false);
    document.body.addEventListener('drop', this.handleDrop.bind(this), false);
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleDragEnter(e) {
    // Find drop zone and add class
    const dropZone = document.querySelector('.drop-zone');
    if (dropZone) {
      dropZone.classList.add('drag-over');
    }
  }

  handleDragLeave(e) {
    // Remove class when leaving
    const dropZone = document.querySelector('.drop-zone');
    if (dropZone && !dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('drag-over');
    }
  }

  async handleDrop(e) {
    const dropZone = document.querySelector('.drop-zone');
    if (dropZone) {
      dropZone.classList.remove('drag-over');
    }

    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      await this.handleFiles(files);
    }
  }

  async handleFiles(files) {
    const file = files[0]; // Handle first file only
    
    if (!this.isValidFile(file)) {
      alert('Please drop a valid JSON file (.json)');
      return;
    }

    try {
      const content = await this.readFile(file);
      this.onFileLoad(content, file.name);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file');
    }
  }

  isValidFile(file) {
    return file.type === 'application/json' || file.name.endsWith('.json');
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  static downloadJSON(data, filename = 'data.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
