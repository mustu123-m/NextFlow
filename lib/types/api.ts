export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  nodes?: any[];
  edges?: any[];
}

export interface ExecuteWorkflowRequest {
  workflowId: string;
  mode: "full" | "selected";
  selectedNodes?: string[];
}

export interface ExecuteWorkflowResponse {
  executionId: string;
  status: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: any;
}