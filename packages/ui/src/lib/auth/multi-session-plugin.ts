/**
 * Re-exported so consumer packages (which cannot resolve `@better-auth-ui/core`
 * directly) register multi-session support through the same
 * `@workspace/ui/lib/auth/*` surface as the other auth plugins.
 *
 * Replaces the pre-plugin-API `multiSession` provider prop. No shadcn wrapper
 * is needed: this plugin contributes config and localization only, not
 * component slots.
 */
export {
  type MultiSessionLocalization,
  multiSessionPlugin,
  type MultiSessionPluginOptions
} from "@better-auth-ui/core/plugins"
