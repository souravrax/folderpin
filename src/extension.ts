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
        const workspaceName = await vscode.window.showInputBox({
          prompt: 'No workspace file found. Name for the new workspace file?',
          value: 'workspace',
          placeHolder: 'e.g. my-project'
        })
        if (!workspaceName) return

        workspaceFilePath = createWorkspaceFile(rootPath, workspaceName)
        isNew = true
      }

      const workspaceData = readWorkspaceFile(workspaceFilePath)
      const relativePath = toRelativePath(workspaceFilePath, uri.fsPath)
      const folderName = path.basename(uri.fsPath)

      // check if already pinned
      const alreadyPinned = workspaceData.folders.some(f => f.path === relativePath)
      if (alreadyPinned) {
        vscode.window.showInformationMessage(`"${folderName}" is already pinned.`)
        return
      }

      // ask for a display name — prefilled with folder name
      const displayName = await vscode.window.showInputBox({
        prompt: 'Name for pinned folder',
        value: folderName,
        placeHolder: 'e.g. UI Components'
      })
      if (displayName === undefined) return // user pressed escape

      // insert pinned folder at the TOP, before everything else
      workspaceData.folders.unshift({
        name: displayName,
        path: relativePath
      })

      writeWorkspaceFile(workspaceFilePath, workspaceData)

      const inWorkspace = vscode.workspace.workspaceFile?.scheme === 'file'

      if (isNew || !inWorkspace) {
        const msg = isNew
          ? 'Workspace file created. Open it now to activate pinning?'
          : `"${displayName}" pinned. Open the workspace file to see changes?`
        const open = await vscode.window.showInformationMessage(
          msg,
          'Open Workspace', 'Later'
        )
        if (open === 'Open Workspace') {
          await vscode.commands.executeCommand(
            'vscode.openFolder',
            vscode.Uri.file(workspaceFilePath)
          )
        }
      } else {
        vscode.window.showInformationMessage(`"${displayName}" pinned.`)
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

      const inWorkspace = vscode.workspace.workspaceFile?.scheme === 'file'

      if (!inWorkspace) {
        const open = await vscode.window.showInformationMessage(
          `Unpinned "${folderName}". Open the workspace file to see changes?`,
          'Open Workspace', 'Later'
        )
        if (open === 'Open Workspace') {
          await vscode.commands.executeCommand(
            'vscode.openFolder',
            vscode.Uri.file(workspaceFilePath)
          )
        }
      } else {
        vscode.window.showInformationMessage(`Unpinned "${folderName}".`)
      }
    }
  )

  context.subscriptions.push(pin, unpin)
}

export function deactivate() {}