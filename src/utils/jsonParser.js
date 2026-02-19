export class JSONParser {
  static parse(jsonString) {
    try {
      // Intentar parsear directamente
      const parsed = JSON.parse(jsonString);
      return { success: true, data: parsed, error: null };
    } catch (error) {
      // Intentar corregir JSON común con errores
      const corrected = this.attemptCorrection(jsonString);
      if (corrected.success) {
        return corrected;
      }
      return { 
        success: false, 
        data: null, 
        error: this.formatError(error, jsonString) 
      };
    }
  }

  static attemptCorrection(jsonString) {
    let corrected = jsonString;

    // Remover trailing commas
    corrected = corrected.replace(/,(\s*[}\]])/g, '$1');

    // Intentar parsear nuevamente
    try {
      const parsed = JSON.parse(corrected);
      return { success: true, data: parsed, error: null, corrected: true };
    } catch (e) {
      return { success: false, data: null, error: null };
    }
  }

  static formatError(error, jsonString) {
    const match = error.message.match(/position (\d+)/);
    let line = 1;
    let column = 1;

    if (match) {
      const position = parseInt(match[1]);
      const lines = jsonString.substring(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return {
      message: error.message,
      line,
      column,
      position: match ? parseInt(match[1]) : null
    };
  }

  static prettify(jsonString, indent = 2) {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, indent);
    } catch {
      return jsonString;
    }
  }

  static minify(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed);
    } catch {
      return jsonString;
    }
  }

  static isValid(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  static getType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  static getSize(value) {
    const type = this.getType(value);
    if (type === 'object') return Object.keys(value).length;
    if (type === 'array') return value.length;
    if (type === 'string') return value.length;
    return null;
  }

  static formatValue(value, type) {
    switch (type) {
      case 'string':
        return `"${value}"`;
      case 'null':
        return 'null';
      case 'boolean':
        return String(value);
      case 'number':
        return String(value);
      default:
        return '';
    }
  }
}
