import { deleteAllByUserId as deleteAllSubscriptionsByUserId } from "@workspace/repository/entities/subscription";
import { deleteAllByUserId as deleteAllTasksByUserId } from "@workspace/repository/entities/tasks";
import {
  deleteOne as deleteUser,
  get,
  updateOne as updateUser,
} from "@workspace/repository/entities/users";
import type {
  AuthUser,
  DeleteAccount,
  DeleteAccountResponse,
  GetUser,
  UpdateProfile,
  UpdateProfileResponse,
} from "@workspace/types/use-cases/users";

export const getUser = async (params: GetUser): Promise<AuthUser> => {
  const { id } = params;

  const user = await get({ id });

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
    emailVerified: user.emailVerified ?? false,
  };
};

export const updateProfile = async (
  params: UpdateProfile
): Promise<UpdateProfileResponse> => {
  const { userId, name } = params;

  const updated = await updateUser({ id: userId, name });

  return {
    id: updated.id,
    email: updated.email,
    name: updated.name ?? null,
    image: updated.image ?? null,
    emailVerified: updated.emailVerified ?? false,
  };
};

export const deleteAccount = async (
  params: DeleteAccount
): Promise<DeleteAccountResponse> => {
  const { userId } = params;

  await deleteAllTasksByUserId({ userId });
  await deleteAllSubscriptionsByUserId({ userId });
  await deleteUser({ id: userId });

  return { deleted: true };
};
