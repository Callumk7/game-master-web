# Node Viewer Library

A reusable, interactive node visualization system for displaying entity relationships with force-directed layouts.

## Features

- **Force-directed simulation** with customizable physics parameters
- **Interactive controls** for real-time parameter adjustment  
- **Dual rendering modes** - Canvas (high performance) and SVG (accessible)
- **Generic data extraction** - works with any data structure
- **Customizable styling** - configure node colors and labels per type
- **Pan, zoom, and drag** interactions
- **TypeScript support** with full type safety

## Quick Start

```tsx
import { NodeViewer, createDefaultNodeExtractor } from "~/lib/node-viewer";

const nodeTypeConfig = {
  user: { color: "fill-blue-500", label: "Users" },
  group: { color: "fill-green-500", label: "Groups" },
};

function MyVisualization({ data }) {
  const nodeExtractor = createDefaultNodeExtractor(["users", "groups"]);
  
  return (
    <NodeViewer
      data={data}
      nodeExtractor={nodeExtractor}
      nodeTypeConfig={nodeTypeConfig}
      onNodeClick={(nodeId, node) => console.log("Clicked:", nodeId)}
    />
  );
}
```

## API Reference

### NodeViewer Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `T` | Your data structure containing entities |
| `nodeExtractor` | `(data: T) => { nodes: Map, connections: Connection[] }` | Function to extract nodes and connections |
| `nodeTypeConfig` | `NodeTypeConfig` | Configuration for node colors and labels |
| `onNodeClick?` | `(nodeId: string, node: any) => void` | Click handler for nodes |
| `className?` | `string` | CSS class for the container |
| `height?` | `number` | Height in pixels (default: 384) |
| `showControls?` | `boolean` | Show force parameter controls (default: true) |
| `initialConfig?` | `Partial<ForceSimulationConfig>` | Override default physics settings |

### Node Type Configuration

```tsx
const nodeTypeConfig: NodeTypeConfig = {
  typeName: {
    color: "fill-blue-500 dark:fill-blue-400", // Tailwind classes
    label: "Display Name"
  }
};
```

### Custom Node Extractor

For complex data structures, implement a custom extractor:

```tsx
function customExtractor(data) {
  const nodes = new Map();
  const connections = [];
  
  // Your extraction logic here
  // Must return { nodes: Map, connections: Connection[] }
  
  return { nodes, connections };
}
```

## File Structure

```
src/lib/node-viewer/
├── components/
│   ├── node-viewer.tsx      # Main component
│   ├── controls.tsx         # Interactive controls
│   └── svg-node-renderer.tsx # SVG rendering
├── hooks/
│   └── use-force-simulation.ts # Physics simulation
├── types/
│   └── index.ts            # TypeScript definitions
├── utils/
│   └── data-extraction.ts  # Data processing utilities
├── index.ts               # Main exports
├── examples.md           # Usage examples
└── README.md            # This file
```

## Architecture

The node viewer is built with modularity in mind:

1. **Data Layer** - Generic extractors handle various data formats
2. **Simulation Layer** - Physics-based force simulation for layout
3. **Rendering Layer** - Canvas and SVG renderers for visualization  
4. **Control Layer** - Interactive controls for real-time adjustment
5. **API Layer** - Simple, flexible component interface

This separation allows you to:
- Use different data sources with the same visualization
- Swap rendering modes for performance vs accessibility
- Customize physics parameters per use case
- Integrate easily into existing applications

## Performance

- Canvas mode for datasets with 100+ nodes
- SVG mode for accessibility and smaller datasets
- Spatial partitioning (QuadTree) for efficient collision detection
- Configurable simulation parameters to balance performance vs quality

## Accessibility

- Full keyboard navigation support
- Screen reader compatible labels and roles
- ARIA attributes on interactive elements
- SVG mode provides semantic markup