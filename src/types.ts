export type SessionState = "disconnected" | "connecting" | "listening" | "speaking" | "idle";

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
}

export interface CanvasItem {
  id: string;
  type: "text" | "image" | "link" | "code";
  title: string;
  content: string;
  timestamp: string;
}

export interface MemoryItem {
  key: string;
  value: string;
  category: "personal" | "preferences" | "facts" | "other";
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 or plain text content
  thumbnailUrl?: string;
}
