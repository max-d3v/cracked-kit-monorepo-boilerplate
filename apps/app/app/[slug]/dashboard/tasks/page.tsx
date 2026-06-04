import { getQueryClient, HydrateClient } from "@workspace/data-layer/hydration";
import { orpc } from "@workspace/data-layer/orpc.tanstack";
import { Suspense } from "react";
import { TasksProvider } from "@/components/tasks/context";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { EditTaskSheet } from "@/components/tasks/edit-task-sheet";
import { TasksContent } from "@/components/tasks/tasks-content";
import { TasksLoading } from "@/components/tasks/tasks-loading";
import { TasksPagination } from "@/components/tasks/tasks-pagination";
import { TasksPerPage } from "@/components/tasks/tasks-per-page";

const TASKS_REFETCH_INTERVAL = 10_000;

export default async function TasksPage() {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    orpc.tasks.getUserTasksWithCount.queryOptions({
      refetchInterval: TASKS_REFETCH_INTERVAL,
    })
  );

  return (
    <TasksProvider>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">Tasks</h1>
            <p className="text-muted-foreground">
              Manage your tasks and track progress
            </p>
          </div>
          <CreateTaskDialog />
        </div>

        <Suspense fallback={<TasksLoading />}>
          <HydrateClient client={queryClient}>
            <TasksContent />
          </HydrateClient>
        </Suspense>

        <div className="flex items-center justify-between">
          <TasksPerPage />
          <TasksPagination />
        </div>

        <EditTaskSheet />
      </div>
    </TasksProvider>
  );
}
