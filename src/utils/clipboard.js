export class Clipboard {
  static async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      return this.fallbackCopy(text);
    }
  }

  static fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return { success };
    } catch (err) {
      document.body.removeChild(textarea);
      return { success: false, error: err };
    }
  }

  static async copyWithNotification(text, message = 'Copied to clipboard') {
    const result = await this.copy(text);
    if (result.success) {
      this.showToast(message);
    } else {
      this.showToast('Failed to copy', 'error');
    }
    return result;
  }

  static showToast(message, type = 'success') {
    // Remove existing toast container
    const existingContainer = document.querySelector('.toast-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    const container = document.createElement('div');
    container.className = 'toast-container';
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    document.body.appendChild(container);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => container.remove(), 200);
    }, 2000);
  }
}
