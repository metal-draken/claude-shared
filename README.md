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
│   ├── agents/hello.md               ← an agent: shared:hello
│   ├── hooks/hooks.json              ← a UserPromptSubmit hook…
│   ├── hooks/hello.sh                ← …that runs this script
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

## Try it end to end

These steps build the layout from the post in a scratch folder: two customers with one project each, and the plugin installed for customer X only. They also add a `CLAUDE.md` and a skill to the parent folder, to show what reaches the projects inside it.

1. Create the two customer folders, each holding one git repo, and clone this repo next to customer X's project:

   ```bash
   mkdir -p ~/claude-demo/customer-x/project-a ~/claude-demo/customer-y/project-b
   ```

   ```bash
   git -C ~/claude-demo/customer-x/project-a init
   ```

   ```bash
   git -C ~/claude-demo/customer-y/project-b init
   ```

   ```bash
   git clone https://github.com/metal-draken/claude-shared.git ~/claude-demo/customer-x/claude-shared
   ```

2. Give the parent folder a `CLAUDE.md` and a skill of its own:

   ```bash
   echo "The customer X marker word is ORANGE-17." > ~/claude-demo/customer-x/CLAUDE.md
   ```

   ```bash
   mkdir -p ~/claude-demo/customer-x/.claude/skills/parent-skill
   ```

   ```bash
   printf -- '---\nname: parent-skill\ndescription: Replies with a fixed greeting from the parent folder.\n---\n\nReply with exactly: "Hello from the parent folder."\n' > ~/claude-demo/customer-x/.claude/skills/parent-skill/SKILL.md
   ```

   The result:

   ```
   claude-demo/
   ├── customer-x/
   │   ├── CLAUDE.md                ← reaches project-a
   │   ├── .claude/skills/          ← doesn't reach project-a
   │   ├── claude-shared/           ← this repo, the marketplace
   │   └── project-a/               ← git repo, plugin installed
   └── customer-y/
       └── project-b/               ← git repo, no plugin
   ```

3. Register the marketplace, then install the plugin in project A only:

   ```bash
   claude plugin marketplace add ~/claude-demo/customer-x/claude-shared
   ```

   ```bash
   cd ~/claude-demo/customer-x/project-a && claude plugin install shared@customer-x --scope local
   ```

4. Start `claude` in each project and compare:

   | Try | In `project-a` | In `project-b` |
   | --- | --- | --- |
   | `/shared:hello` | "Hello from the shared plugin." | Unknown skill |
   | "Use the shared:hello agent" | "Hello from the shared agent." | No such agent |
   | "What is the customer X marker word?" | ORANGE-17, from the parent `CLAUDE.md` | Doesn't know |
   | `/parent-skill` | Unknown skill: the search stops at the git root | Unknown skill |

5. Clean up. Uninstall the plugin, remove the marketplace from your Claude Code settings, and delete the folder:

   ```bash
   cd ~/claude-demo/customer-x/project-a && claude plugin uninstall shared@customer-x --scope local
   ```

   ```bash
   claude plugin marketplace remove customer-x
   ```

   ```bash
   cd ~ && rm -rf ~/claude-demo
   ```

## Editing

Because the marketplace is a local folder, the plugin loads in place. Edit a file, then start a new session or run `/reload-plugins`. No version bump. MCP server changes need a new session. Hook scripts are read each time they run, so they need neither.

## Reusing it elsewhere

1. Copy `claude-shared/` into the new work folder.
2. Change the marketplace `name` in `marketplace.json`.
3. Register it and install it per project with the new names.

## Names

Plugin content is prefixed with the plugin's name:

| Piece | Name in a session |
| --- | --- |
| Skill | `/shared:hello` |
| Agent | `shared:hello` |
| MCP tool | `mcp__plugin_shared_hello__greet` |
