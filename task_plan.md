# Plan de Implementación - JSON Viewer Web App

## Descripción del Proyecto
Aplicación web para visualizar archivos JSON de cualquier tamaño con:
- Pestaña Source: input vía paste o drag-drop
- Pestaña Viewer: árbol interactivo y colapsable
- Context menu en nodos (copiar key/value)
- Sidebar con detalles del nodo seleccionado (grid key/value)

## Objetivo
Crear una aplicación SPA (Single Page Application) moderna, performante y con excelente UX para visualización de JSON.

---

## Stack Tecnológico

### Core
- **Framework**: Vanilla JavaScript (ES2020+) + HTML5 + CSS3
- **Bundler**: Vite (rápido, moderno, HMR)
- **Estilos**: CSS puro con variables CSS para theming

### Librerías (mínimas)
- **JSON Parser**: Native `JSON.parse()` con streaming para archivos grandes
- **Virtualización**: Custom implementation para tree rendering eficiente
- **Iconos**: Lucide (SVG, ligero)

### Estructura de Archivos
```
jsonviewer/
├── index.html              # Entry point
├── src/
│   ├── main.js            # Entry JS
│   ├── styles/
│   │   ├── main.css       # Estilos globales
│   │   ├── components.css # Estilos de componentes
│   │   └── theme.css      # Variables CSS
│   ├── components/
│   │   ├── App.js         # Componente raíz
│   │   ├── SourceTab.js   # Tab de input
│   │   ├── ViewerTab.js   # Tab de visualización
│   │   ├── TreeView.js    # Componente de árbol
│   │   ├── TreeNode.js    # Nodo individual del árbol
│   │   ├── Sidebar.js     # Panel lateral de detalles
│   │   └── ContextMenu.js # Menú contextual
│   ├── utils/
│   │   ├── jsonParser.js  # Parser con manejo de errores
│   │   ├── treeBuilder.js # Construcción de estructura tree
│   │   ├── clipboard.js   # Utilidades de copiado
│   │   └── fileHandler.js # Drag & drop handler
│   └── state/
│       └── store.js       # State management simple
├── package.json
└── vite.config.js
```

---

## Fases de Implementación

### Phase 1: Setup y Estructura Base (Priority: HIGH)
**Status**: `pending`
**Estimated Time**: 30 min

#### Tareas
- [ ] Inicializar proyecto con Vite
- [ ] Crear estructura de carpetas
- [ ] Configurar CSS base y variables de tema
- [ ] Crear HTML semántico con tabs
- [ ] Implementar sistema de tabs simple

#### Decisions
- Usar Vite por simplicidad y performance
- Vanilla JS sin frameworks para máximo control
- CSS Grid para layout principal

#### Files to Create
- `package.json`
- `vite.config.js`
- `index.html`
- `src/main.js`
- `src/styles/main.css`
- `src/styles/theme.css`

---

### Phase 2: Source Tab - Input de JSON (Priority: HIGH)
**Status**: `pending`
**Estimated Time**: 45 min

#### Tareas
- [ ] Crear textarea para input manual
- [ ] Implementar drag & drop de archivos
- [ ] Crear parser de JSON robusto (manejo de errores)
- [ ] Auto-format JSON al pegar (prettify)
- [ ] Validación visual (indicador de válido/inválido)
- [ ] Botón "Load to Viewer"

#### Features
- Drag overlay visual feedback
- Soportar archivos .json
- Detectar y manejar JSON minificado
- Mostrar error específico si el JSON es inválido

#### Files to Create/Modify
- `src/components/SourceTab.js`
- `src/utils/jsonParser.js`
- `src/utils/fileHandler.js`

---

### Phase 3: Tree View Component (Priority: HIGH)
**Status**: `pending`
**Estimated Time**: 60 min

#### Tareas
- [ ] Crear estructura de datos tree a partir de JSON
- [ ] Implementar renderizado recursivo de nodos
- [ ] Agregar iconos de expand/collapse
- [ ] Implementar toggle de nodos
- [ ] Soporte para diferentes tipos de datos:
  - Object: `{}` con contador de keys
  - Array: `[]` con contador de items
  - String: `"value"`
  - Number: `123`
  - Boolean: `true/false`
  - null: `null`
- [ ] Estilos diferenciados por tipo
- [ ] Virtualización básica para archivos grandes

#### Technical Details
```javascript
// Estructura de nodo
{
  id: uniqueId,
  key: string,
  value: any,
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null',
  depth: number,
  expanded: boolean,
  children: Node[],
  parent: Node | null
}
```

#### Files to Create/Modify
- `src/components/TreeView.js`
- `src/components/TreeNode.js`
- `src/utils/treeBuilder.js`

---

### Phase 4: Interacciones - Click y Context Menu (Priority: HIGH)
**Status**: `pending`
**Estimated Time**: 45 min

#### Tareas
- [ ] Implementar click en nodo (selección)
- [ ] Implementar right-click context menu
- [ ] Opciones de context menu:
  - Copy Key
  - Copy Value
  - Copy Key-Value Pair
  - Copy Path (dot notation)
  - Copy as JSON
  - Expand/Collapse All Children
- [ ] Cerrar context menu al click afuera
- [ ] Posicionamiento inteligente del menú

#### UX Considerations
- Feedback visual al copiar (toast notification)
- Highlight del nodo seleccionado
- Path navigation en header del viewer

#### Files to Create/Modify
- `src/components/ContextMenu.js`
- `src/utils/clipboard.js`

---

### Phase 5: Sidebar - Panel de Detalles (Priority: HIGH)
**Status**: `pending`
**Estimated Time**: 45 min

#### Tareas
- [ ] Crear layout de sidebar (derecha, colapsable)
- [ ] Implementar grid de key-value
- [ ] Value display en multilinea con scroll
- [ ] Auto-selección de texto al hacer click
- [ ] Mostrar metadatos del nodo:
  - Type
  - Path
  - Size (bytes/chars)
  - Children count (si aplica)
- [ ] Toggle para mostrar/ocultar sidebar

#### Layout
```
┌────────────────────────────────────┬─────────────┐
│                                    │  Selected:  │
│    Tree View                       │  user.name  │
│                                    │             │
│    ▼ {                             ├─────────────┤
│      "id": 123                     │  Type       │
│      "name": "John" ← selected     │  string     │
│      "email": "..."                │             │
│    }                               │  Value      │
│                                    │  ┌────────┐ │
│                                    │  │ "John" │ │
│                                    │  └────────┘ │
│                                    │  (selectable)│
└────────────────────────────────────┴─────────────┘
```

#### Files to Create/Modify
- `src/components/Sidebar.js`
- `src/styles/components.css`

---

### Phase 6: Optimización y Performance (Priority: MEDIUM)
**Status**: `pending`
**Estimated Time**: 45 min

#### Tareas
- [ ] Implementar virtual scrolling para JSONs grandes
- [ ] Lazy loading de nodos del árbol
- [ ] Debounce en búsqueda (si aplica)
- [ ] Web Workers para parsing de archivos grandes
- [ ] Memoización de nodos renderizados
- [ ] Optimización de re-renders

#### Performance Targets
- Render >10,000 nodos sin lag
- Parsear archivos >10MB en <2s
- Smooth scrolling a 60fps

#### Files to Create/Modify
- `src/utils/virtualScroller.js`
- `src/workers/jsonWorker.js`

---

### Phase 7: Polish y UX Final (Priority: MEDIUM)
**Status**: `pending`
**Estimated Time**: 30 min

#### Tareas
- [ ] Animaciones de transición (tabs, expand/collapse)
- [ ] Tema oscuro/claro toggle
- [ ] Keyboard shortcuts:
  - Ctrl/Cmd + F: Buscar
  - Ctrl/Cmd + C: Copiar seleccionado
  - Escape: Cerrar sidebar/context menu
- [ ] Empty states (no JSON loaded)
- [ ] Loading states
- [ ] Responsive design básico
- [ ] Tooltips informativos

#### Files to Create/Modify
- `src/styles/animations.css`
- `src/utils/keyboard.js`

---

### Phase 8: Testing y Deploy (Priority: LOW)
**Status**: `pending`
**Estimated Time**: 20 min

#### Tareas
- [ ] Probar con JSONs de diferentes tamaños
- [ ] Probar edge cases:
  - JSON anidado muy profundo
  - Arrays con 1000+ items
  - Strings muy largos
  - Unicode y emojis
  - Null values
  - Circular references (manejar error)
- [ ] Build de producción
- [ ] Verificar bundle size

#### Files to Create
- `tests/test-data/` (JSONs de prueba)

---

## Requisitos Técnicos Detallados

### 1. Parser de JSON
- **Manejo de errores**: Mostrar línea y columna del error
- **Prettify automático**: Al detectar JSON minificado
- **Streaming**: Para archivos >5MB usar chunked parsing
- **Preservar formatos**: No perder información de números grandes o especiales

### 2. Tree View
- **Indentación visual**: 16px por nivel de profundidad
- **Line guides**: Líneas verticales conectando siblings
- **Type indicators**: Iconos/colores por tipo de dato
- **Collapsible**: Todos los nodos expandibles/colapsables
- **Search/Filter**: Resaltar nodos que matcheen búsqueda

### 3. Context Menu
- **Posición**: Aparecer cerca del cursor, ajustar si se sale de pantalla
- **Acciones**:
  ```
  Copy Key
  Copy Value
  Copy Path (e.g., "users[0].name")
  Copy as JSON
  ─────────────
  Expand All
  Collapse All
  ```

### 4. Sidebar
- **Layout**: Grid de 2 columnas (key | value)
- **Value**: Textarea o div con `white-space: pre-wrap`
- **Selección**: Click en value selecciona todo el texto
- **Responsive**: En pantallas pequeñas, sidebar como overlay

### 5. State Management
```javascript
// Store structure
{
  json: Object | null,
  parsedTree: TreeNode | null,
  selectedNode: TreeNode | null,
  expandedPaths: Set<string>,
  view: 'source' | 'viewer',
  sidebarOpen: boolean,
  searchQuery: string
}
```

---

## Decisiones de Diseño

### ¿Por qué Vanilla JS y no React/Vue?
1. **Control total**: Manejo preciso del DOM para virtualización
2. **Performance**: Sin overhead de framework
3. **Bundle size**: Mínimo posible
4. **Complejidad**: App es suficientemente simple

### ¿Por qué Vite?
1. HMR instantáneo
2. Build optimizado sin configuración
3. Soporte ES modules nativo
4. CSS modules sin setup

### ¿Cómo manejar archivos grandes?
1. **Virtual scrolling**: Solo renderizar nodos visibles
2. **Lazy expansion**: No procesar nodos colapsados
3. **Web Workers**: Parsing en thread separado
4. **Chunked reading**: Para archivos >10MB

---

## Mockup de UI

```
┌────────────────────────────────────────────────────────────┐
│  JSON Viewer                                    [🌙][?]    │
├────────────────────────────────────────────────────────────┤
│  [ Source ]  [ Viewer ]                                    │
├────────────────────────────────────────────────────────────┴─────────────┐
│                                                                          │
│  ┌────────────────────────────────────┬─────────────┐                    │
│  │                                    │  Selected:  │                    │
│  │  ▼ {                               │  user.email │                    │
│  │    "id": 123,                      │             │                    │
│  │    "name": "John Doe",             ├─────────────┤                    │
│  │    ▶ "address": {...},             │  Type       │                    │
│  │    "email": "john@example.com" ←───│  string     │                    │
│  │    ▶ "orders": [...]               │             │                    │
│  │  }                                 │  Value      │                    │
│  │                                    │  ┌────────┐ │                    │
│  │  (right-click for menu)            │  │ john@  │ │                    │
│  │                                    │  │ example│ │                    │
│  │                                    │  │ .com   │ │                    │
│  │                                    │  └────────┘ │                    │
│  │                                    │             │                    │
│  │                                    │  Path       │                    │
│  │                                    │  user.email │                    │
│  └────────────────────────────────────┴─────────────┘                    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Timeline Estimado

| Phase | Tiempo | Acumulado |
|-------|--------|-----------|
| 1. Setup | 30 min | 30 min |
| 2. Source Tab | 45 min | 1h 15m |
| 3. Tree View | 60 min | 2h 15m |
| 4. Interacciones | 45 min | 3h |
| 5. Sidebar | 45 min | 3h 45m |
| 6. Optimización | 45 min | 4h 30m |
| 7. Polish | 30 min | 5h |
| 8. Testing | 20 min | 5h 20m |

**Total estimado**: ~5.5 horas

---

## Próximos Pasos

1. ¿Confirmas el stack tecnológico?
2. ¿Hay alguna feature adicional que quieras incluir?
3. ¿Tienes preferencia por algún color scheme específico?
4. ¿Necesitas soporte offline (PWA)?

Una vez confirmado, procedo con **Phase 1: Setup y Estructura Base**.
