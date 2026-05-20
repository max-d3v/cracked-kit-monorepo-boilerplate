import billingRouter from "./routers/billing";
import tasksRouter from "./routers/tasks";
import usersRouter from "./routers/users";

export const router = {
  tasks: tasksRouter,
  billing: billingRouter,
  users: usersRouter,
};
