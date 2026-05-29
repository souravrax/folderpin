# FolderPin

Pin any folder to the top of your VS Code: explorer — instantly.

## Features

- **Pin folders** directly from the Explorer context menu
- **Unpin** just as easily when you no longer need quick access
- Pinned folders appear at the **top** of your workspace explorer
- Uses your existing **`.code-workspace`** file — no extra config needed
- Smart prompts: if you're not inside a workspace yet, FolderPin guides you to open it so changes take effect immediately

## How it works

1. Right-click any folder in the Explorer
2. Select **"Pin to Workspace"**
3. Name your pin (defaults to the folder name)
4. If a workspace file doesn't exist yet, FolderPin helps you create and name one

The folder is added to the top of your `.code-workspace` file and appears instantly in your explorer.

## Commands

| Command | When |
|---|---|
| `Pin to Workspace` | Right-click a folder in the Explorer |
| `Unpin from Workspace` | Right-click a pinned folder |

Both commands live in the workspace section of the context menu, keeping your menu clean and organized.

## Requirements

- VS Code: `^1.74.0`
- A folder or workspace must be open

## Extension Settings

This extension does not contribute any settings yet.

## Known Issues

None at this time. [File an issue](https://github.com/souravkl11/folderpin/issues) if you find something.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for full release history.

---

**Enjoy!**
