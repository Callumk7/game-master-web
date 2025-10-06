# Node Viewer Examples

This document shows how to use the Node Viewer system for different types of data.

## Basic Usage

```tsx
import { NodeViewer, createDefaultNodeExtractor } from "~/lib/node-viewer";

const nodeTypeConfig = {
  user: { color: "fill-blue-500", label: "Users" },
  group: { color: "fill-green-500", label: "Groups" },
};

function MyComponent({ data }) {
  const nodeExtractor = createDefaultNodeExtractor(["users", "groups"]);
  
  const handleNodeClick = (nodeId, node) => {
    console.log("Clicked node:", nodeId, node);
  };

  return (
    <NodeViewer
      data={data}
      nodeExtractor={nodeExtractor}
      nodeTypeConfig={nodeTypeConfig}
      onNodeClick={handleNodeClick}
      height={500}
    />
  );
}
```

## Custom Node Extractor

For complex data structures, create a custom node extractor:

```tsx
import { NodeViewer } from "~/lib/node-viewer";

function customNodeExtractor(apiResponse) {
  const nodes = new Map();
  const connections = [];
  
  // Extract nodes from nested structure
  apiResponse.departments?.forEach(dept => {
    nodes.set(dept.id, {
      id: dept.id,
      name: dept.name,
      type: 'department',
      children: dept.employees || []
    });
    
    // Add employees as nodes
    dept.employees?.forEach(emp => {
      nodes.set(emp.id, {
        id: emp.id,
        name: emp.name,
        type: 'employee'
      });
      
      // Create connection between department and employee
      connections.push({
        from: dept.id,
        to: emp.id,
        strength: 2
      });
    });
  });
  
  return { nodes, connections };
}

const nodeTypeConfig = {
  department: { color: "fill-purple-500", label: "Departments" },
  employee: { color: "fill-blue-500", label: "Employees" },
};

function OrganizationChart({ data }) {
  return (
    <NodeViewer
      data={data}
      nodeExtractor={customNodeExtractor}
      nodeTypeConfig={nodeTypeConfig}
      height={600}
      showControls={true}
    />
  );
}
```

## Without Controls

For a cleaner presentation:

```tsx
<NodeViewer
  data={data}
  nodeExtractor={nodeExtractor}
  nodeTypeConfig={nodeTypeConfig}
  showControls={false}
  height={300}
  className="border rounded-lg"
/>
```

## Custom Force Configuration

Override default physics parameters:

```tsx
<NodeViewer
  data={data}
  nodeExtractor={nodeExtractor}
  nodeTypeConfig={nodeTypeConfig}
  initialConfig={{
    repulsionStrength: 15000,
    attractionStrength: 20,
    centerForceStrength: 8,
    targetLinkLength: 200,
  }}
/>
```