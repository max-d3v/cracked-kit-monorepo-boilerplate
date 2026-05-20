import type { SQL, SQLWrapper } from "@workspace/database/client";
import { and, db, desc, eq } from "@workspace/database/client";
import { subscription } from "@workspace/database/schema";
import { HttpError } from "@workspace/types/errors/http";
import type {
  CreateSubscriptionParams,
  DeleteSubscriptionParams,
  GetSubscriptionParams,
  JoinableParams,
  ListSubscriptionsParams,
  SubscriptionRawObject,
  UpdateSubscriptionParams,
  WhereClauseParams,
} from "@workspace/types/repository/subscription";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUM = 1;

const buildSearchClause = (_search?: string) => {
  // No searchable text fields on subscription
  return undefined;
};

const buildWhere = (whereables: WhereClauseParams) => {
  const { userId } = whereables;

  const whereClause: SQLWrapper[] = [];
  if (userId) {
    whereClause.push(eq(subscription.userId, userId));
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

  if (include?.user) {
    joinClause.user = true;
  }

  return joinClause;
};

export const list = async (params: ListSubscriptionsParams) => {
  const {
    search,
    pageNum = DEFAULT_PAGE_NUM,
    pageSize = DEFAULT_PAGE_SIZE,
    include,
    ...rest
  } = params;

  const offset = (pageNum - 1) * pageSize;

  const data = await db.query.subscription.findMany({
    where: buildWhereClause({ search, ...rest }),
    orderBy: desc(subscription.createdAt),
    limit: pageSize,
    offset,
    with: buildJoinClause(include),
  });

  return data;
};

export const get = async (
  params: GetSubscriptionParams
): Promise<SubscriptionRawObject> => {
  const { userId } = params;

  const found = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  });

  if (!found) {
    throw new HttpError(404, "Subscription not found");
  }

  return found;
};

export const find = async (
  userId: string
): Promise<SubscriptionRawObject[]> => {
  const result = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .orderBy(desc(subscription.createdAt))
    .limit(1);

  return result;
};

export const getOrCreate = async (
  params: GetSubscriptionParams
): Promise<SubscriptionRawObject> => {
  const { userId } = params;

  const existing = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  });

  if (existing) {
    return existing;
  }

  const result = await db.insert(subscription).values({ userId }).returning();

  const created = result[0];
  if (!created) {
    throw new HttpError(500, "Failed to create subscription");
  }

  return created;
};

export const create = async (
  params: CreateSubscriptionParams
): Promise<SubscriptionRawObject> => {
  const result = await db.insert(subscription).values(params).returning();

  const created = result[0];
  if (!created) {
    throw new HttpError(500, "Failed to create subscription");
  }

  return created;
};

export const updateOne = async (
  params: UpdateSubscriptionParams
): Promise<SubscriptionRawObject> => {
  const { userId, ...data } = params;

  const result = await db
    .update(subscription)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscription.userId, userId))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new HttpError(404, "Subscription not found");
  }

  return updated;
};

export const deleteOne = async (
  params: DeleteSubscriptionParams
): Promise<SubscriptionRawObject> => {
  const { userId } = params;

  const result = await db
    .delete(subscription)
    .where(eq(subscription.userId, userId))
    .returning();

  const deleted = result[0];
  if (!deleted) {
    throw new HttpError(404, "Subscription not found");
  }

  return deleted;
};

export const deleteAllByUserId = async (params: {
  userId: string;
}): Promise<void> => {
  const { userId } = params;
  await db.delete(subscription).where(eq(subscription.userId, userId));
};
