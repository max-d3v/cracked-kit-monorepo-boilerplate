import type { SQL, SQLWrapper } from "@workspace/database/client";
import {
  and,
  count,
  db,
  desc,
  eq,
  ilike,
  or,
} from "@workspace/database/client";
import { organization, task } from "@workspace/database/schema";
import { HttpError } from "@workspace/types/errors/http";
import type {
  CreateTaskParams,
  DeleteTaskParams,
  GetTaskParams,
  JoinableParams,
  ListTasksParams,
  TaskRawObject,
  TaskStatusCount,
  UpdateTaskParams,
  WhereClauseParams,
} from "@workspace/types/repository/tasks";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUM = 1;

const buildSearchClause = (search?: string) => {
  if (!search) {
    return undefined;
  }
  return or(
    ilike(task.title, `%${search}%`),
    ilike(task.description, `%${search}%`)
  );
};

const buildWhere = (whereables: WhereClauseParams) => {
  const { userId, organizationId } = whereables;

  const whereClause: SQLWrapper[] = [];
  if (userId) {
    whereClause.push(eq(task.userId, userId));
  }
  if (organizationId) {
    whereClause.push(eq(organization.id, organizationId));
  }

  return and(...whereClause);
};

const buildWhereClause = (params: WhereClauseParams): SQL | undefined => {
  const { search, ...data } = params;
  const searchClause = buildSearchClause(search);
  const where = buildWhere(data);

  const whereClause: SQLWrapper[] = [];
  if (searchClause) {
    whereClause.push(searchClause);
  }
  if (where) {
    whereClause.push(where);
  }

  return and(...whereClause);
};

const buildJoinClause = (include: JoinableParams | undefined) => {
  const joinClause: Record<string, boolean> = {};

  if (include?.users) {
    joinClause.users = true;
  }
  if (include?.organizations) {
    joinClause.organizations = true;
  }

  return joinClause;
};

export const list = async (params: ListTasksParams) => {
  const {
    search,
    pageNum = DEFAULT_PAGE_NUM,
    pageSize = DEFAULT_PAGE_SIZE,
    include,
    ...rest
  } = params;

  const offset = (pageNum - 1) * pageSize;

  const data = await db.query.task.findMany({
    where: buildWhereClause({ search, ...rest }),
    orderBy: desc(task.createdAt),
    limit: pageSize,
    offset,
    with: buildJoinClause(include),
  });

  return data;
};

export const listAllByUserId = async (params: {
  userId: string;
}): Promise<TaskRawObject[]> => {
  const { userId } = params;

  return await db.query.task.findMany({
    where: eq(task.userId, userId),
    orderBy: desc(task.createdAt),
  });
};

export const countByStatus = async (params: {
  userId: string;
}): Promise<TaskStatusCount[]> => {
  const { userId } = params;

  return await db
    .select({ status: task.status, count: count() })
    .from(task)
    .where(eq(task.userId, userId))
    .groupBy(task.status);
};

export const get = async (params: GetTaskParams): Promise<TaskRawObject> => {
  const { id } = params;

  const found = await db.query.task.findFirst({
    where: eq(task.id, id),
  });

  if (!found) {
    throw new HttpError(404, "Task not found");
  }

  return found;
};

export const find = async (userId: string): Promise<TaskRawObject[]> => {
  const result = await db
    .select()
    .from(task)
    .where(eq(task.userId, userId))
    .orderBy(desc(task.createdAt))
    .limit(1);

  return result;
};

export const create = async (
  params: CreateTaskParams
): Promise<TaskRawObject> => {
  const { userId, ...data } = params;

  const result = await db
    .insert(task)
    .values({ ...data, userId })
    .returning();

  const created = result[0];
  if (!created) {
    throw new HttpError(500, "Failed to create task");
  }

  return created;
};

export const updateOne = async (
  params: UpdateTaskParams
): Promise<TaskRawObject> => {
  const { id, userId, ...data } = params;

  const result = await db
    .update(task)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(task.id, id), eq(task.userId, userId)))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new HttpError(404, "Task not found");
  }

  return updated;
};

export const deleteOne = async (
  params: DeleteTaskParams
): Promise<TaskRawObject> => {
  const { id, userId } = params;

  const result = await db
    .delete(task)
    .where(and(eq(task.id, id), eq(task.userId, userId)))
    .returning();

  const deleted = result[0];
  if (!deleted) {
    throw new HttpError(404, "Task not found");
  }

  return deleted;
};

export const deleteAllByUserId = async (params: {
  userId: string;
}): Promise<void> => {
  const { userId } = params;
  await db.delete(task).where(eq(task.userId, userId));
};
