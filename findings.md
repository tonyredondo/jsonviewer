# Findings - JSON Viewer Project

## Fecha de Inicio
2026-02-19

---

## Decisiones de Arquitectura

### Estructura de Datos del Tree
La estructura del árbol debe mantener referencias bidireccionales para facilitar:
- Navegación hacia arriba (parent)
- Cálculo de paths (dot notation)
- Expansión/colapso de sub-árboles

```javascript
class TreeNode {
  constructor({ key, value, type, depth, parent = null }) {
    this.id = generateId();
    this.key = key;
    this.value = value;
    this.type = type;
    this.depth = depth;
    this.parent = parent;
    this.children = [];
    this.expanded = false;
  }
}
```

### Virtualización
Para archivos grandes, usar "windowing" approach:
- Calcular altura total del árbol
- Renderizar solo nodos visibles + buffer
- Usar `transform: translateY()` para posicionamiento
- Actualizar en scroll events (debounced)

### Parsing de JSON
- Usar `JSON.parse()` nativo para confiabilidad
- Para archivos grandes (>5MB), considerar streaming parser
- Preservar order de keys (Object.keys mantiene orden de inserción en ES2015+)
- Manejar números grandes con BigInt si es necesario

---

## Problemas Potenciales y Soluciones

| Problema | Solución |
|----------|----------|
| JSON con circular references | Pre-validar, mostrar error amigable |
| Strings muy largos (>1000 chars) | Truncar en tree, mostrar completo en sidebar |
| Arrays con 10k+ items | Virtualización + lazy rendering |
| Profundidad excesiva (>50 niveles) | Limitar indentación visual, mostrar warning |
| Archivos muy grandes (>50MB) | Web Worker + chunked processing |
| Copiar valores con formatting | Usar JSON.stringify con indentación configurable |

---

## Recursos Útiles

### Documentación
- [MDN: JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
- [MDN: DataTransfer API](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

### Inspiración de UI
- Chrome DevTools Network tab JSON viewer
- VS Code JSON tree view
- JSON Crack (jsoncrack.com)
- jq play (jqlang.github.io/jq-playground/)

---

## Notas de Implementación

### Context Menu
- Prevenir default `contextmenu` event
- Calcular posición: `x = Math.min(mouseX, window.innerWidth - menuWidth - 10)`
- Cerrar en: click afuera, Escape, scroll, resize

### Drag & Drop
- Eventos: `dragenter`, `dragover`, `dragleave`, `drop`
- Prevent default en `dragover` y `drop`
- Visual feedback con clase CSS `.drag-over`
- Validar file.type === 'application/json' o extensión .json

### Sidebar Grid
```css
.sidebar-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
}
```

### Copy to Clipboard
```javascript
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  } catch (err) {
    // Fallback: seleccionar texto + execCommand
  }
}
```

---

## Performance Targets

| Métrica | Objetivo |
|---------|----------|
| Time to Interactive | < 2s |
| First Contentful Paint | < 1s |
| Parse JSON 1MB | < 500ms |
| Render 1000 nodos | < 100ms |
| Scroll con virtualización | 60fps |
| Memory usage (JSON 10MB) | < 100MB |

---

## Schema de Tipos JSON

```typescript

type JSONValue = 
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };

type NodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

interface TreeNode {
  id: string;
  key: string;
  value: JSONValue;
  type: NodeType;
  depth: number;
  expanded: boolean;
  parent: TreeNode | null;
  children: TreeNode[];
}
```

---

## Temas de Color

### Dark Theme (Default)
```css
--bg-primary: #1e1e1e;
--bg-secondary: #252526;
--bg-tertiary: #2d2d30;
--text-primary: #d4d4d4;
--text-secondary: #858585;
--accent: #007acc;
--accent-hover: #1177bb;
--border: #3e3e42;
--string: #ce9178;
--number: #b5cea8;
--boolean: #569cd6;
--null: #569cd6;
--key: #9cdcfe;
```

### Light Theme
```css
--bg-primary: #ffffff;
--bg-secondary: #f3f3f3;
--bg-tertiary: #e8e8e8;
--text-primary: #333333;
--text-secondary: #666666;
--accent: #0078d4;
--accent-hover: #106ebe;
--border: #e0e0e0;
--string: #a31515;
--number: #098658;
--boolean: #0000ff;
--null: #0000ff;
--key: #0451a5;
```

---

## Edge Cases Identificados

1. **JSON vacío**: `{}`, `[]`, `null`
2. **Keys con caracteres especiales**: espacios, emojis, símbolos
3. **Valores multilinea**: strings con `\n`
4. **Unicode**: emojis, caracteres chinos, árabes
5. **Números especiales**: Infinity, -Infinity, NaN (no válidos en JSON)
6. **Keys duplicadas**: última ocurrencia gana en JSON.parse
7. **Profundidad excesiva**: stack overflow en parse profundo
8. **Memory leaks**: limpiar listeners al destruir componentes

---

## Registro de Cambios

### 2026-02-19
- Creado plan inicial
- Definido stack tecnológico
- Documentado estructura de datos
- Identificados edge cases principales
