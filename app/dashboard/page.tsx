"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import * as api from "@/lib/utils/api";
import toast from "react-hot-toast";

interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      loadWorkflows();
    }
  }, [isLoaded, user]);

  async function loadWorkflows() {
    try {
      const data = await api.listWorkflows();
      setWorkflows(data);
    } catch (error) {
      toast.error("Failed to load workflows");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteWorkflow(id: string) {
    setDeleting(id);
    try {
      await api.deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      toast.success("Workflow deleted");
    } catch (error) {
      toast.error("Failed to delete workflow");
      console.error(error);
    } finally {
      setDeleting(null);
    }
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-secondary bg-secondary/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Welcome back, {user?.firstName || "User"}
              </p>
            </div>
            <Link href="/dashboard/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Workflow
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p>Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-muted-foreground">No workflows yet</p>
              <Link href="/dashboard/new">
                <Button>Create your first workflow</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:border-primary transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {workflow.description || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/workflows/${workflow.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteWorkflow(workflow.id)}
                      disabled={deleting === workflow.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}