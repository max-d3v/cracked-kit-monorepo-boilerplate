import type { user } from "@workspace/database/schema";
import type { ListBaseParams } from "./base";

export type UserRawObject = typeof user.$inferSelect;

export type CreateUserParams = typeof user.$inferInsert;

export type UpdateUserParams = Partial<typeof user.$inferInsert> & {
  id: string;
};

export type WhereParams = {
  email?: string;
  organizationId?: string;
};

export type JoinableParams = {
  organization: boolean;
  tasks: boolean;
  memberships: boolean;
};

export type GetUserParams = {
  id: string;
};

export type GetUserByClerkIdParams = {
  id: string;
};

export type DeleteUserParams = {
  id: string;
};

export type WhereClauseParams = WhereParams & {
  search?: string;
};

export type ListUsersParams = ListBaseParams &
  WhereParams & {
    include?: JoinableParams;
  };
