/// <reference types="vite/client" />

// Type definitions for React Native Web
declare module 'react-native' {
  export * from 'react-native-web';
}

// Type definitions for React Native FS
declare module 'react-native-fs' {
  interface StatResult {
    name: string;
    path: string;
    size: number;
    mode: number;
    ctime: number;
    mtime: number;
    originalFilepath: string;
    isFile: () => boolean;
    isDirectory: () => boolean;
  }

  interface ReadDirItem {
    ctime: Date | null;
    isDirectory: () => boolean;
    isFile: () => boolean;
    mtime: Date | null;
    name: string;
    path: string;
    size: number;
  }

  const RNFS: {
    // Common directories
    DocumentDirectoryPath: string;
    DownloadDirectoryPath: string;
    ExternalDirectoryPath: string;
    ExternalStorageDirectoryPath: string;
    TemporaryDirectoryPath: string;
    LibraryDirectoryPath: string;
    FileProtectionKeys: any;
    
    // File operations
    readDir(dirpath: string): Promise<ReadDirItem[]>;
    readFile(filepath: string, encoding?: string): Promise<string>;
    read(filepath: string, length?: number, position?: number, encoding?: string): Promise<string>;
    writeFile(filepath: string, contents: string, encoding?: string): Promise<void>;
    appendFile(filepath: string, contents: string, encoding?: string): Promise<void>;
    moveFile(filepath: string, destPath: string): Promise<void>;
    copyFile(filepath: string, destPath: string): Promise<void>;
    unlink(filepath: string): Promise<void>;
    exists(filepath: string): Promise<boolean>;
    mkdir(dirpath: string, options?: { NSURLIsExcludedFromBackupKey?: boolean, NSFileProtectionKey?: string }): Promise<void>;
    stat(filepath: string): Promise<StatResult>;
    scanFile(path: string): Promise<void>;
    
    // Android specific
    copyFileAssets(assetPath: string, destinationPath: string): Promise<void>;
    copyFileRes(filename: string, destPath: string): Promise<void>;
    existsAssets(assetPath: string): Promise<boolean>;
    existsRes(filename: string): Promise<boolean>;
    
    // iOS specific
    pathForBundle(bundleName: string): Promise<string>;
    pathForGroup(groupName: string): Promise<string>;
    getFSInfo(): Promise<{
      freeSpace: number;
      totalSpace: number;
    }>;
  };
  
  export default RNFS;
}

// Type definitions for React Native Permissions
declare module 'react-native-permissions' {
  export type PermissionStatus = 'granted' | 'denied' | 'never_ask_again' | 'blocked' | 'unavailable' | 'limited';
  
  export interface Rationale {
    title: string;
    message: string;
    buttonPositive?: string;
    buttonNegative?: string;
    buttonNeutral?: string;
  }
  
  export interface Permission {
    request(): Promise<PermissionStatus>;
    check(): Promise<PermissionStatus>;
  }
  
  const Permissions: {
    [key: string]: Permission;
  };
  
  export default Permissions;
}

// Process type definitions
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  };
  platform: string;
  versions: {
    node: string;
    v8: string;
    [key: string]: string;
  };
};

// Global development flag
declare const __DEV__: boolean;

// Global Buffer type for Node.js compatibility
declare const Buffer: {
  from(data: any, encoding?: string): any;
  alloc(size: number, fill?: string | number | Buffer, encoding?: string): Buffer;
  isBuffer(obj: any): boolean;
  concat(list: Buffer[], totalLength?: number): Buffer;
};

// Global URLSearchParams for browser compatibility
declare class URLSearchParams {
  constructor(init?: string[][] | Record<string, string> | string | URLSearchParams);
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  sort(): void;
  toString(): string;
  forEach(callback: (value: string, name: string, searchParams: URLSearchParams) => void, thisArg?: any): void;
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  [Symbol.iterator](): IterableIterator<[string, string]>;
}

// Global URL for browser compatibility
declare class URL {
  constructor(url: string, base?: string | URL);
  hash: string;
  host: string;
  hostname: string;
  href: string;
  readonly origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  searchParams: URLSearchParams;
  username: string;
  toJSON(): string;
  toString(): string;
  static createObjectURL(obj: Blob | MediaSource | MediaStream): string;
  static revokeObjectURL(url: string): void;
}

// Add missing browser globals
declare const Blob: {
  prototype: Blob;
  new(blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
};

declare const FileReader: {
  prototype: FileReader;
  new(): FileReader;
  readonly DONE: number;
  readonly EMPTY: number;
  readonly LOADING: number;
};

// Add missing Node.js globals
declare module 'stream';
declare module 'path';
declare module 'fs';
declare module 'os';

// Add missing Node.js process types
interface Process {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  };
  platform: string;
  versions: {
    node: string;
    v8: string;
    [key: string]: string;
  };
  nextTick(callback: (...args: any[]) => void, ...args: any[]): void;
  cwd(): string;
}
