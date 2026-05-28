import * as vscode from 'vscode'
import * as path from 'path'
import {
  findWorkspaceFile,
  createWorkspaceFile,
  readWorkspaceFile,
  writeWorkspaceFile,
  toRelativePath
} from './storage'

export function activate(context: vscode.ExtensionContext) {

  // ── PIN ──────────────────────────────────────────────
  const pin = vscode.commands.registerCommand(
    'explorerPins.pin',
    async (uri: vscode.Uri) => {
      if (!uri) {
        vscode.window.showErrorMessage('Right click a folder to pin it.')
        return
      }

      const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
      if (!rootPath) {
        vscode.window.showErrorMessage('Open a folder or workspace first.')
        return
      }

      // find or create the .code-workspace file
      let workspaceFilePath = findWorkspaceFile()
      let isNew = false

      if (!workspaceFilePath) {
        const create = await vscode.window.showInformationMessage(
          'No .code-workspace file found. Create one?',
          'Create', 'Cancel'
        )
        if (create !== 'Create') return
        workspaceFilePath = createWorkspaceFile(rootPath)
        isNew = true
      }

      const workspaceData = readWorkspaceFile(workspaceFilePath)
      const relativePath = toRelativePath(workspaceFilePath, uri.fsPath)
      const folderName = path.basename(uri.fsPath)

      // check if already pinned
      const alreadyPinned = workspaceData.folders.some(f => f.path === relativePath)
      if (alreadyPinned) {
        vscode.window.showInformationMessage(`📌 "${folderName}" is already pinned.`)
        return
      }

      // ask for a display name — prefilled with folder name
      const displayName = await vscode.window.showInputBox({
        prompt: 'Name for pinned folder',
        value: `📌 ${folderName}`,
        placeHolder: 'e.g. 📌 UI Components'
      })
      if (displayName === undefined) return // user pressed escape

      // insert pinned folder at the TOP, before everything else
      workspaceData.folders.unshift({
        name: displayName,
        path: relativePath
      })

      writeWorkspaceFile(workspaceFilePath, workspaceData)

      // if we just created the workspace file, offer to open it
      if (isNew) {
        const open = await vscode.window.showInformationMessage(
          'Workspace file created. Open it now to activate pinning?',
          'Open Workspace', 'Later'
        )
        if (open === 'Open Workspace') {
          await vscode.commands.executeCommand(
            'vscode.openFolder',
            vscode.Uri.file(workspaceFilePath)
          )
        }
      } else {
        // already in a workspace file — just reload to reflect changes
        const reload = await vscode.window.showInformationMessage(
          `📌 "${displayName}" pinned. Reload to see changes?`,
          'Reload', 'Later'
        )
        if (reload === 'Reload') {
          await vscode.commands.executeCommand('workbench.action.reloadWindow')
        }
      }
    }
  )

  // ── UNPIN ─────────────────────────────────────────────
  const unpin = vscode.commands.registerCommand(
    'explorerPins.unpin',
    async (uri: vscode.Uri) => {
      if (!uri) return

      const workspaceFilePath = findWorkspaceFile()
      if (!workspaceFilePath) {
        vscode.window.showErrorMessage('No .code-workspace file found.')
        return
      }

      const workspaceData = readWorkspaceFile(workspaceFilePath)
      const relativePath = toRelativePath(workspaceFilePath, uri.fsPath)
      const folderName = path.basename(uri.fsPath)

      const exists = workspaceData.folders.some(f => f.path === relativePath)
      if (!exists) {
        vscode.window.showInformationMessage(`"${folderName}" is not pinned.`)
        return
      }

      // remove it
      workspaceData.folders = workspaceData.folders.filter(
        f => f.path !== relativePath
      )

      writeWorkspaceFile(workspaceFilePath, workspaceData)

      const reload = await vscode.window.showInformationMessage(
        `Unpinned "${folderName}". Reload to see changes?`,
        'Reload', 'Later'
      )
      if (reload === 'Reload') {
        await vscode.commands.executeCommand('workbench.action.reloadWindow')
      }
    }
  )

  context.subscriptions.push(pin, unpin)
}

export function deactivate() {}