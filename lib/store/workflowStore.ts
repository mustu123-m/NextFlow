import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/lib/types";

export interface WorkflowState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  history: Array<{ nodes: Node<NodeData>[]; edges: Edge[] }>;
  historyIndex: number;
  selectedNodeId: string | null;
  isExecuting: boolean;
  executionId: string | null;

  // Actions
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  addNode: (node: Node<NodeData>) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  selectNode: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setExecuting: (executing: boolean, executionId?: string) => void;
  reset: () => void;
  saveToHistory: () => void;
}

const initialState = {
  nodes: [],
  edges: [],
  history: [],
  historyIndex: -1,
  selectedNodeId: null,
  isExecuting: false,
  executionId: null,
};

export const useWorkflowStore = create<WorkflowState>()(
  devtools((set, get) => ({
    ...initialState,

    setNodes: (nodes) =>
      set((state) => ({
        nodes,
      })),

    setEdges: (edges) =>
      set((state) => ({
        edges,
      })),

    updateNode: (id, data) =>
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, ...data } as NodeData }
            : node
        ),
      })),

    deleteNode: (id) =>
      set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== id),
        edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      })),

    addNode: (node) =>
      set((state) => ({
        nodes: [...state.nodes, node],
      })),

    addEdge: (edge) =>
      set((state) => ({
        edges: [...state.edges, edge],
      })),

    removeEdge: (id) =>
      set((state) => ({
        edges: state.edges.filter((edge) => edge.id !== id),
      })),

    selectNode: (id) =>
      set({
        selectedNodeId: id,
      }),

    saveToHistory: () =>
      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({
          nodes: state.nodes,
          edges: state.edges,
        });
        return {
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }),

    undo: () =>
      set((state) => {
        if (state.historyIndex <= 0) return state;
        const newIndex = state.historyIndex - 1;
        const snapshot = state.history[newIndex];
        return {
          nodes: snapshot.nodes,
          edges: snapshot.edges,
          historyIndex: newIndex,
        };
      }),

    redo: () =>
      set((state) => {
        if (state.historyIndex >= state.history.length - 1) return state;
        const newIndex = state.historyIndex + 1;
        const snapshot = state.history[newIndex];
        return {
          nodes: snapshot.nodes,
          edges: snapshot.edges,
          historyIndex: newIndex,
        };
      }),

    canUndo: () => get().historyIndex > 0,

    canRedo: () => get().historyIndex < get().history.length - 1,

    setExecuting: (executing, executionId) =>
      set({
        isExecuting: executing,
        executionId: executionId || null,
      }),

    reset: () => set(initialState),
  }))
);