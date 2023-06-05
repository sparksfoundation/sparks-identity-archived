# ARCHIVED 
Monorepo has been archived in preference to split approach. See 
- sparks-app
- sparks-ui
- sparks-api
- sparks-sdk
- ...

# Sparks Identity

### Repository Structure

The project is comprised of several packages and is home to non-technical things specific to SPARKS Foundation.

[pnpm](https://pnpm.io/) is used for [workspace](https://pnpm.io/workspaces) & [package](https://pnpm.io/pnpm-cli) managements, [install](https://pnpm.io/installation) if needed.

Once you have pnpm, install the dependencies at the root level:

```
pnpm install
```

#### apps

Executable apps that you can run locally or deploy to a server. Each direct subfolder of the `apps` directory is an application.

#### libs

Shared libraries that are used by the `apps` or other repositories.

#### Commands

You can run package commands from the root level using the filter flag eg.

```bash
# run the pwa agent dev server
pnpm --filter pwa-agent run dev

# run the api server dev server
pnpm --filter api-service run dev

# run the linter in pwa agent
pnpm --filter pwa-agent run lint
```
