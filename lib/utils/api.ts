import axios from "axios";
import { ExecuteNodeRequest, ExecuteNodeResponse } from "@/lib/types/api";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Workflows API
export async function createWorkflow(data: any) {
  const response = await apiClient.post("/api/workflows", data);
  return response.data;
}

export async function getWorkflow(id: string) {
  const response = await apiClient.get(`/api/workflows/${id}`);
  return response.data;
}

export async function updateWorkflow(id: string, data: any) {
  const response = await apiClient.put(`/api/workflows/${id}`, data);
  return response.data;
}

export async function deleteWorkflow(id: string) {
  await apiClient.delete(`/api/workflows/${id}`);
}

export async function listWorkflows() {
  const response = await apiClient.get("/api/workflows");
  return response.data;
}

// Execution API
export async function executeWorkflow(workflowId: string, mode = "full") {
  const response = await apiClient.post("/api/executions", {
    workflowId,
    mode,
  });
  return response.data;
}

export async function executeNode(request: ExecuteNodeRequest) {
  const response = await apiClient.post("/api/executions/node", request);
  return response.data as ExecuteNodeResponse;
}

export async function getExecutionHistory(workflowId: string) {
  const response = await apiClient.get(`/api/executions/history/${workflowId}`);
  return response.data;
}

export async function getExecutionDetails(executionId: string) {
  const response = await apiClient.get(`/api/executions/${executionId}`);
  return response.data;
}