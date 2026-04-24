import { Node, Edge } from "reactflow";

// Validate workflow DAG (no circular dependencies)
export function validateDAG(nodes: Node[], edges: Edge[]): boolean {
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return true; // Skip validation if not arrays
  }

  const adjacencyList = new Map<string, string[]>();
  
  // Build adjacency list
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });
  
  edges.forEach(edge => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
  });
  
  // DFS to detect cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const hasCycle = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  };
  
  for (const nodeId of nodes.map(n => n.id)) {
    if (!visited.has(nodeId)) {
      if (hasCycle(nodeId)) return false;
    }
  }
  
  return true;
}

// Validate node connections
export function validateConnections(nodes: Node[], edges: Edge[]): string[] {
  const errors: string[] = [];
  
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return errors; // Skip validation if not arrays
  }
  
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) {
      errors.push(`Invalid connection: nodes not found`);
      return;
    }
    
    // Type-safe connection validation
    const validConnections: Record<string, string[]> = {
      text: ["llm", "cropImage"],
      uploadImage: ["llm", "cropImage"],
      uploadVideo: ["extractFrame"],
      llm: ["llm", "text"],
      cropImage: ["llm"],
      extractFrame: ["llm"],
    };
    
    const sourceType = sourceNode.data?.type;
    const targetType = targetNode.data?.type;
    
    if (!validConnections[sourceType]?.includes(targetType)) {
      errors.push(
        `Invalid connection: ${sourceType} cannot connect to ${targetType}`
      );
    }
  });
  
  return errors;
}

// Calculate execution order (topological sort)
export function calculateExecutionOrder(
  nodes: Node[],
  edges: Edge[]
): string[] {
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return []; // Return empty if not arrays
  }

  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  // Initialize
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  // Build graph
  edges.forEach(edge => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });
  
  // Topological sort (Kahn's algorithm)
  const queue: string[] = [];
  const result: string[] = [];
  
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });
  
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);
    
    (adjacencyList.get(nodeId) || []).forEach(neighbor => {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  return result;
}