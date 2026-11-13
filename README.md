# claude-shared example

A minimal local plugin marketplace for Claude Code. It shares skills, hooks and MCP servers across the repos in one work folder, without making them global and without copying them into each project.

This is the example from the post "Share Claude Code skills across repos with a local plugin marketplace". The post explains why it works this way and how each piece was tested. Tested on Claude Code 2.1.285, macOS.

## What's in it

```
claude-shared/
├── .claude-plugin/marketplace.json   ← the marketplace: its name + list of plugins
├── plugins/shared/                   ← the plugin
│   ├── .claude-plugin/plugin.json    ← name + version
│   ├── skills/hello/SKILL.md         ← a skill: /shared:hello
│   ├── hooks/hooks.json              ← a UserPromptSubmit hook
│   ├── .mcp.json                     ← an MCP server entry
│   └── mcp/hello.mjs                 ← the MCP server, no dependencies
└── templates/settings.json           ← copied into new projects, never loaded
```

Each piece is a throwaway mock. Replace them with your own skills, agents, hooks and MCP servers.

## Try it without installing

From any project, load the plugin for one session:

```bash
claude --plugin-dir path/to/claude-shared/plugins/shared
```

Then run `/shared:hello`. It replies with "Hello from the shared plugin."

## Wiring it up

1. Clone or copy this repo into the folder that holds your repos, for example `~/dev/customer-x/claude-shared`.
2. Rename the marketplace. Change `name` in `.claude-plugin/marketplace.json`, since two marketplaces on one machine can't share a name. The commands below use `customer-x`.
3. Register the marketplace, once per machine:

   ```bash
   claude plugin marketplace add ~/dev/customer-x/claude-shared
   ```

4. Install the plugin, once per project, from inside it:

   ```bash
   claude plugin install shared@customer-x --scope local
   ```

   `--scope local` writes to the git-ignored `.claude/settings.local.json`, so the plugin stays in your own copy of the repo. `--scope project` writes to `.claude/settings.json`, which is committed. Teammates still need to register the marketplace on their own machine.

A project without the install never sees the plugin.

## Editing

Because the marketplace is a local folder, the plugin loads in place. Edit a file, then start a new session or run `/reload-plugins`. No version bump. MCP server changes need a new session.

## Reusing it elsewhere

1. Copy `claude-shared/` into the new work folder.
2. Change the marketplace `name` in `marketplace.json`.
3. Register it and install it per project with the new names.

## Names

Plugin content is prefixed with the plugin's name:

| Piece | Name in a session |
| --- | --- |
| Skill | `/shared:hello` |
| MCP tool | `mcp__plugin_shared_hello__greet` |
