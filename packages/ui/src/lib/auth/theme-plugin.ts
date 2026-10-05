/**
 * Re-exported so consumer packages (which cannot resolve `@better-auth-ui/core`
 * directly) register theme switching through the same
 * `@workspace/ui/lib/auth/*` surface as the other auth plugins.
 *
 * Replaces the pre-plugin-API `appearance={{ theme, setTheme }}` provider prop.
 * No shadcn wrapper is needed: this plugin contributes config and localization
 * only, not component slots.
 */
export {
  type ThemeLocalization,
  themePlugin,
  type ThemePluginOptions
} from "@better-auth-ui/core/plugins"
