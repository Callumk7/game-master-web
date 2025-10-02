# useKeyboardShortcut Hook - Complete Guide

## Overview

The `useKeyboardShortcut` hook provides a clean, declarative way to handle keyboard shortcuts in React components with built-in accessibility, cross-platform support, and scope management.

## Core Features

- **Cross-platform compatibility** (Cmd on Mac, Ctrl on Windows/Linux)
- **Scope management** (shortcuts only work in specific contexts)
- **Input protection** (automatically disabled in form fields)
- **Multiple shortcuts per hook**
- **Flexible modifier key support**

## Basic Usage

### Single Platform Shortcut
```typescript
import { usePlatformShortcut } from "~/hooks/useKeyboardShortcut";

function MyComponent() {
  // Cmd+S on Mac, Ctrl+S on Windows/Linux
  usePlatformShortcut("s", () => {
    saveDocument();
  });
  
  return <div>Press Cmd/Ctrl+S to save</div>;
}
```

### Multiple Shortcuts
```typescript
import { useKeyboardShortcut, createPlatformShortcut } from "~/hooks/useKeyboardShortcut";

function MyComponent() {
  useKeyboardShortcut([
    createPlatformShortcut("s", () => saveDocument()),
    createPlatformShortcut("o", () => openDocument()),
    createPlatformShortcut("n", () => newDocument()),
  ]);
  
  return <div>Multiple shortcuts available</div>;
}
```

## Advanced Usage Examples

### Modal-Specific Shortcuts
```typescript
function MyModal({ isOpen, onClose }) {
  useKeyboardShortcut([
    // Only works when modal is open
    {
      key: "Escape",
      callback: onClose,
      options: { scope: () => isOpen }
    },
    // Cmd+Enter to submit, only when modal is open
    createPlatformShortcut("Enter", () => {
      handleSubmit();
    }, { scope: () => isOpen }),
  ]);
  
  return isOpen ? <div>Modal content</div> : null;
}
```

### Form Shortcuts (Working in Inputs)
```typescript
function MyForm() {
  useKeyboardShortcut([
    // Works even when typing in form fields
    createPlatformShortcut("Enter", () => {
      submitForm();
    }, { 
      allowInInputs: true,
      scope: () => isFormValid 
    }),
    
    // Escape to cancel, works anywhere
    {
      key: "Escape",
      callback: () => cancelForm(),
      options: { allowInInputs: true }
    }
  ]);
  
  return <form>...</form>;
}
```

### Complex Modifier Combinations
```typescript
function MyEditor() {
  useKeyboardShortcut([
    // Cmd+Shift+Z for redo
    {
      key: "z",
      modifiers: { meta: true, shift: true }, // Mac
      callback: () => redo(),
    },
    {
      key: "z", 
      modifiers: { ctrl: true, shift: true }, // Windows/Linux
      callback: () => redo(),
    },
    
    // Alt+Arrow for navigation
    {
      key: "ArrowLeft",
      modifiers: { alt: true },
      callback: () => navigateBack(),
    },
  ]);
  
  return <div>Editor content</div>;
}
```

## Helper Functions

### `createPlatformShortcut(key, callback, options?)`
Automatically uses the right modifier (Cmd/Ctrl) for the platform:
```typescript
// Creates Cmd+S on Mac, Ctrl+S elsewhere
createPlatformShortcut("s", () => save())
```

### `createPlatformShiftShortcut(key, callback, options?)`
Same as above but adds Shift modifier:
```typescript
// Creates Cmd+Shift+S on Mac, Ctrl+Shift+S elsewhere
createPlatformShiftShortcut("s", () => saveAs())
```

## Options Reference

```typescript
interface KeyboardShortcutOptions {
  enabled?: boolean;        // Enable/disable shortcut conditionally
  preventDefault?: boolean; // Prevent browser default (default: true)
  allowInInputs?: boolean;  // Work even in form fields (default: false)
  scope?: () => boolean;    // Only work when this returns true
}
```

## Real-World Examples

### Global App Shortcuts
```typescript
// In your root component or layout
function AppLayout() {
  const navigate = useNavigate();
  
  useKeyboardShortcut([
    // Global search
    createPlatformShortcut("k", () => {
      openGlobalSearch();
    }),
    
    // Quick navigation
    createPlatformShortcut("1", () => navigate("/dashboard")),
    createPlatformShortcut("2", () => navigate("/projects")),
    createPlatformShortcut("3", () => navigate("/settings")),
  ]);
  
  return <div>App content</div>;
}
```

### Data Table Shortcuts
```typescript
function DataTable({ selectedRows, onDelete, onEdit }) {
  useKeyboardShortcut([
    // Delete selected items
    {
      key: "Delete",
      callback: () => onDelete(selectedRows),
      options: { 
        scope: () => selectedRows.length > 0,
        preventDefault: false // Let browser handle if no selection
      }
    },
    
    // Edit first selected item
    {
      key: "Enter", 
      callback: () => onEdit(selectedRows[0]),
      options: { scope: () => selectedRows.length === 1 }
    },
  ]);
  
  return <table>...</table>;
}
```

### Image Gallery/Viewer
```typescript
function ImageGallery({ currentIndex, images, onNext, onPrev, isOpen }) {
  useKeyboardShortcut([
    // Navigation
    {
      key: "ArrowRight",
      callback: onNext,
      options: { scope: () => isOpen }
    },
    {
      key: "ArrowLeft", 
      callback: onPrev,
      options: { scope: () => isOpen }
    },
    
    // Close with Escape
    {
      key: "Escape",
      callback: () => setIsOpen(false),
      options: { scope: () => isOpen }
    },
  ]);
  
  return isOpen ? <div>Gallery view</div> : null;
}
```

## Best Practices

1. **Use scope for context-specific shortcuts**:
   ```typescript
   { scope: () => isModalOpen && !isLoading }
   ```

2. **Be careful with `allowInInputs`** - only use when necessary:
   ```typescript
   // Good: Global save shortcut
   createPlatformShortcut("s", save, { allowInInputs: true })
   
   // Bad: Navigation shortcuts in inputs
   // Don't do this - interferes with typing
   ```

3. **Group related shortcuts together**:
   ```typescript
   // Editor shortcuts
   useKeyboardShortcut([
     createPlatformShortcut("b", toggleBold),
     createPlatformShortcut("i", toggleItalic),
     createPlatformShortcut("u", toggleUnderline),
   ]);
   ```

4. **Use descriptive scope functions**:
   ```typescript
   const canEdit = () => user.hasPermission && !isReadOnly;
   
   createPlatformShortcut("e", startEdit, { scope: canEdit })
   ```

## Common Patterns

- **Sequential shortcuts**: Combine multiple keys for complex actions
- **Conditional shortcuts**: Use scope to enable/disable based on state
- **Form shortcuts**: Use `allowInInputs` for submit/cancel actions
- **Navigation shortcuts**: Arrow keys, Tab, Enter for UI navigation
- **Action shortcuts**: Platform shortcuts for save, copy, paste, etc.

## Current Implementation in App

### Commander Component
The main commander uses these shortcuts:

- **⌘J** - Toggle commander (global, works anywhere)
- **⌘⇧C** - New Character (when commander open)
- **⌘⇧F** - New Faction (when commander open) 
- **⌘⇧L** - New Location (when commander open)
- **⌘⇧N** - New Note (when commander open)
- **⌘⇧Q** - New Quest (when commander open)
- **⌘⇧T** - Open Todos (when commander open)

Implementation:
```typescript
useKeyboardShortcut([
  // Global shortcut to toggle commander
  createPlatformShortcut("j", () => {
    setIsCommanderOpen(!isCommanderOpen);
  }),
  // Commander-specific shortcuts (Cmd+Shift to avoid browser conflicts)
  createPlatformShiftShortcut("c", () => {
    setIsCommanderOpen(false);
    setIsCreateCharacterOpen(true);
  }, { scope: () => isCommanderOpen, allowInInputs: true }),
  // ... more shortcuts
]);
```

The hook is designed to be flexible and reusable across your entire application while maintaining good performance and accessibility standards.
