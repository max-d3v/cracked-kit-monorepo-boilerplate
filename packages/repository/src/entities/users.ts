import type { SQL, SQLWrapper } from "@workspace/database/client";
import { and, db, desc, eq, ilike, or } from "@workspace/database/client";
import { organization, user } from "@workspace/database/schema";
import { HttpError } from "@workspace/types/errors/http";
import type {
  CreateUserParams,
  DeleteUserParams,
  GetUserParams,
  JoinableParams,
  ListUsersParams,
  UpdateUserParams,
  UserRawObject,
  WhereClauseParams,
} from "@workspace/types/repository/users";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUM = 1;

const buildSearchClause = (search?: string) => {
  if (!search) {
    return undefined;
  }
  return or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`));
};

const buildWhere = (whereables: WhereClauseParams) => {
  const { email, organizationId } = whereables;

  const whereClause: SQLWrapper[] = [];

  if (email) {
    whereClause.push(eq(user.email, email));
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

  if (include?.organization) {
    joinClause.organization = true;
  }
  if (include?.tasks) {
    joinClause.tasks = true;
  }
  if (include?.memberships) {
    joinClause.memberships = true;
  }

  return joinClause;
};

export const list = async (params: ListUsersParams) => {
  const {
    search,
    pageNum = DEFAULT_PAGE_NUM,
    pageSize = DEFAULT_PAGE_SIZE,
    include,
    ...rest
  } = params;

  const offset = (pageNum - 1) * pageSize;

  const data = await db.query.user.findMany({
    where: buildWhereClause({ search, ...rest }),
    orderBy: desc(user.createdAt),
    limit: pageSize,
    offset,
    with: buildJoinClause(include),
  });

  return data;
};

export const get = async (params: GetUserParams): Promise<UserRawObject> => {
  const { id } = params;

  const found = await db.query.user.findFirst({
    where: eq(user.id, id),
  });

  if (!found) {
    throw new HttpError(404, "User not found");
  }

  return found;
};

export const create = async (
  params: CreateUserParams
): Promise<UserRawObject> => {
  const result = await db.insert(user).values(params).returning();

  const created = result[0];
  if (!created) {
    throw new HttpError(500, "Failed to create user");
  }

  return created;
};

export const upsert = async (
  params: CreateUserParams
): Promise<UserRawObject> => {
  const { id, ...rest } = params;

  const result = await db
    .insert(user)
    .values({ id, ...rest })
    .onConflictDoUpdate({
      target: user.id,
      set: { ...rest, updatedAt: new Date() },
    })
    .returning();

  const upserted = result[0];
  if (!upserted) {
    throw new HttpError(500, "Failed to upsert user");
  }

  return upserted;
};

export const updateOne = async (
  params: UpdateUserParams
): Promise<UserRawObject> => {
  const { id, ...data } = params;

  const result = await db
    .update(user)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new HttpError(404, "User not found");
  }

  return updated;
};

export const deleteOne = async (
  params: DeleteUserParams
): Promise<UserRawObject> => {
  const { id } = params;

  const result = await db.delete(user).where(eq(user.id, id)).returning();

  const deleted = result[0];
  if (!deleted) {
    throw new HttpError(404, "User not found");
  }

  return deleted;
};
