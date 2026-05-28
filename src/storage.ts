import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export interface WorkspaceFile {
  folders: { name?: string; path: string }[]
  settings?: Record<string, unknown>
  extensions?: Record<string, unknown>
}

// finds the .code-workspace file in the current open workspace
export function findWorkspaceFile(): string | null {
  const workspaceFile = vscode.workspace.workspaceFile
  
  // if already opened via a .code-workspace file, use that
  if (workspaceFile && workspaceFile.scheme === 'file') {
    return workspaceFile.fsPath
  }

  // otherwise look for one in the root folder
  const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  if (!rootPath) return null

  const files = fs.readdirSync(rootPath)
  const found = files.find(f => f.endsWith('.code-workspace'))
  if (found) return path.join(rootPath, found)

  return null
}

export function readWorkspaceFile(filePath: string): WorkspaceFile {
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

export function writeWorkspaceFile(filePath: string, data: WorkspaceFile) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

// creates a brand new .code-workspace file if none exists
export function createWorkspaceFile(rootPath: string): string {
  const filePath = path.join(rootPath, 'workspace.code-workspace')
  const initial: WorkspaceFile = {
    folders: [{ name: 'root', path: '.' }],
    settings: {}
  }
  writeWorkspaceFile(filePath, initial)
  return filePath
}

// converts absolute folder path to relative path from workspace file location
export function toRelativePath(workspaceFilePath: string, folderPath: string): string {
  return path.relative(path.dirname(workspaceFilePath), folderPath)
}