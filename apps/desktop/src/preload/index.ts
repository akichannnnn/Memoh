import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Renderer-facing API surface. Keep this intentionally small — it is the
// full security boundary between chromium renderer processes and the
// node-privileged main process.
const api = {
  window: {
    // Focus (or create) the settings window. When `target` is supplied —
    // e.g. `/settings/bots/<botId>?tab=mcp` resolved by the chat router —
    // the main process forwards it to the settings renderer over the
    // `settings:navigate` channel after the window has finished loading.
    openSettings: (target?: string): Promise<void> =>
      ipcRenderer.invoke('window:open-settings', target),
    closeSelf: (): Promise<void> => ipcRenderer.invoke('window:close-self'),
    // Settings renderer subscribes here to handle in-window navigation
    // requests pushed by the main process (cold-start replay or warm
    // updates). Returns no unsubscribe handle — the listener is meant to
    // live for the entire window lifetime.
    onSettingsNavigate: (cb: (target: string) => void): void => {
      ipcRenderer.on('settings:navigate', (_event: IpcRendererEvent, target: string) => {
        cb(target)
      })
    },
  },
}

export type MemohApi = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
