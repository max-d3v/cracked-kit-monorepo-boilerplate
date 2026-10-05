/**
 * Re-exported so consumer packages (which cannot resolve `@better-auth-ui/core`
 * directly) register account deletion through the same
 * `@workspace/ui/lib/auth/*` surface as the other auth plugins.
 *
 * Replaces the pre-plugin-API `deleteUser={{ enabled: true }}` provider prop.
 * No shadcn wrapper is needed: this plugin contributes config and localization
 * only, not component slots.
 */
export {
  type DeleteUserLocalization,
  deleteUserPlugin,
  type DeleteUserPluginOptions
} from "@better-auth-ui/core/plugins"
