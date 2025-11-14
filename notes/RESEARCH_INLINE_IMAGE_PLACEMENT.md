# Technical Research Report: Inline Image Placement Enhancement

**Author:** Claude
**Date:** 2025-11-13
**Status:** Research Complete

---

## Executive Summary

This report analyzes the current image handling implementation and proposes a solution to enable users to insert existing (already-uploaded) images into editor content without re-uploading them. The research identifies that both upload methods currently use the same API endpoint but differ in whether the image URL is embedded in the editor content. The recommended solution involves creating a custom Tiptap extension similar to the existing mention system, allowing users to reference existing images by ID rather than URL.

---

## 1. Current Implementation Analysis

### 1.1 Editor Architecture

The application uses **Tiptap** (a headless rich-text editor built on ProseMirror) as the primary content editor.

**Key Files:**
- Editor component: `src/components/ui/editor/index.tsx`
- Entity editor wrapper: `src/components/ui/editor/entity-editor.tsx`
- Content utilities: `src/components/ui/editor/utils.ts`
- Content hooks: `src/components/ui/editor/hooks.ts`

**Content Storage:**
- Editor content is stored as **JSON-stringified Tiptap document** in the `content` field
- Plain text version stored in `content_plain_text` field
- Content structure: `{ type: "doc", content: [...nodes] }`

### 1.2 Current Image Upload Methods

#### Method 1: Inline Upload (via Editor)

**Location:** `src/components/ui/editor/index.tsx:485-511`

**Workflow:**
1. User clicks image button in toolbar OR drags/pastes image
2. File picker opens / file is dropped
3. Image uploaded via `uploadEntityImageMutation()` API call
4. API returns `{ data: { file_url: "uploads/..." } }`
5. URL constructed as `${SERVER_URL}/${result.data.file_url}`
6. Image inserted into Tiptap: `editor.chain().focus().setImage({ src: url, alt: filename }).run()`
7. **Result:** Creates database record AND embeds URL in editor JSON

**Editor Extensions:**
- Standard Tiptap `Image` extension (line 240-246)
- `FileHandler` extension for drag-and-drop (line 247-273)

**Configuration:**
```typescript
Image.configure({
  inline: false,
  allowBase64: false,
  HTMLAttributes: {
    class: "editor-image",
  },
})
```

#### Method 2: Direct Upload (via ImageUpload Component)

**Location:** `src/components/ui/image-upload.tsx`

**Workflow:**
1. User drops/selects image in dropzone
2. Image uploaded via same `uploadEntityImageMutation()` API
3. Image gallery refreshed via query invalidation
4. **Result:** Creates database record only, NO editor content update

**Key Component:**
```typescript
<ImageUpload
  gameId={gameId}
  entityId={entityId}
  entityType={entityType}
  onUploadSuccess={onUploadSuccess}
/>
```

### 1.3 Image Data Model

**Type Definition:** `src/api/types.gen.ts:656-715`

```typescript
export type Image = {
  id: string;                    // Unique image ID
  entity_id: string;             // Parent entity ID
  entity_type: 'character' | 'faction' | 'location' | 'quest' | 'note';
  file_url: string;              // Relative path to image file
  filename: string;              // Original filename
  alt_text?: string;             // Accessibility text
  content_type: string;          // MIME type
  file_size: number;             // Size in bytes
  file_size_mb: number;          // Size in MB
  is_primary: boolean;           // Whether this is the primary image
  position_y: number;            // Banner placement position
  metadata?: { [key: string]: unknown };
  inserted_at: string;           // Creation timestamp
  updated_at: string;            // Last update timestamp
}
```

**API Endpoints:**
- `POST /games/:game_id/:entity_type/:entity_id/images` - Upload image
- `GET /games/:game_id/:entity_type/:entity_id/images` - List images
- `DELETE /games/:game_id/:entity_type/:entity_id/images/:id` - Delete image
- `PUT /games/:game_id/:entity_type/:entity_id/images/:id/primary` - Set primary

### 1.4 Image Display Components

**Image Gallery:** `src/components/images/image-gallery.tsx`
- Displays grid of all entity images
- Allows setting primary image, deleting images
- Opens image viewer modal on click

**Image Grid:** `src/components/images/image-grid.tsx`
- Renders responsive grid layout
- Integrates with image controls dropdown

**Entity-Specific Components:**
- `src/components/characters/character-images.tsx`
- `src/components/factions/faction-images.tsx`
- `src/components/locations/location-images.tsx`
- `src/components/notes/note-images.tsx`

---

## 2. Problem Statement

### 2.1 Current Behavior

**Scenario:**
1. User uploads image via ImageUpload component → Creates database record
2. User wants to insert that image in editor content → Must re-upload
3. Re-uploading creates **duplicate database record** for the same image file

### 2.2 Issues

1. **Image Duplication:** Same image file stored multiple times in database
2. **Storage Waste:** Unnecessary disk space consumption
3. **Management Complexity:** Multiple records for the same visual asset
4. **User Experience:** Counterintuitive workflow requiring re-upload

### 2.3 Root Cause

The current Image extension stores images by **URL reference** (`src` attribute) rather than by **database ID reference**. When an image is uploaded through the editor:
- URL is embedded directly in editor JSON: `{ type: "image", attrs: { src: "http://..." } }`
- No link to the database record ID
- No way to insert existing database record into editor without re-upload

---

## 3. Analysis of Existing Reference Pattern: Mentions

### 3.1 How Mentions Work

The application already has a working example of entity references in editor content: the **mention system**.

**Key Files:**
- `src/components/ui/editor/mention-extension-simple.tsx`
- `src/components/ui/editor/mention-component.tsx`
- `src/components/ui/editor/mention-list.tsx`

### 3.2 Mention Data Structure

Mentions are stored as Tiptap nodes with entity references:

```typescript
{
  type: "mention",
  attrs: {
    id: "entity-uuid",
    label: "Entity Name",
    type: "character" | "faction" | "location" | "note" | "quest",
    gameId: "game-uuid"
  }
}
```

### 3.3 Mention Features

1. **Custom Tiptap Node Extension:** `Node.create()` with custom attributes
2. **React Component Rendering:** Uses `ReactNodeViewRenderer(MentionComponent)`
3. **Autocomplete Suggestion:** Tiptap Suggestion API with popup
4. **Reference Integrity:** Stores ID, not duplicated data
5. **Interactive Component:** Clickable links to entity pages

### 3.4 Relevance to Image Solution

The mention pattern provides a **proven blueprint** for:
- Creating custom node types with references
- Rendering React components in editor
- Implementing autocomplete/selection UI
- Maintaining data integrity through ID references

---

## 4. Proposed Solution: Referenced Image Extension

### 4.1 Solution Overview

Create a new Tiptap extension `EntityImage` (or `ReferencedImage`) that stores images by **database ID reference** instead of URL.

### 4.2 Dual Image Node Strategy

Support both image types in the editor:

1. **External Images (existing):** Standard Tiptap Image with URL
   - For images from external sources (copy/paste URLs)
   - Stored as: `{ type: "image", attrs: { src: "https://..." } }`

2. **Entity Images (new):** Referenced images from database
   - For images uploaded to the entity
   - Stored as: `{ type: "entityImage", attrs: { imageId: "...", entityId: "...", ... } }`

### 4.3 Data Structure

**EntityImage Node Attributes:**

```typescript
interface EntityImageAttributes {
  imageId: string;        // Database image ID
  entityId: string;       // Parent entity ID
  entityType: EntityType; // Entity type
  gameId: string;         // Game ID
  alt?: string;           // Alt text (from database)
  width?: number;         // Optional width
  height?: number;        // Optional height
  align?: 'left' | 'center' | 'right'; // Alignment
}
```

**Storage in Tiptap JSON:**

```json
{
  "type": "entityImage",
  "attrs": {
    "imageId": "550e8400-e29b-41d4-a716-446655440000",
    "entityId": "entity-uuid",
    "entityType": "character",
    "gameId": "game-uuid",
    "alt": "Character portrait"
  }
}
```

### 4.4 UI/UX Design

#### Option A: Toolbar Dropdown

Add a dropdown to the existing image button:
- **"Upload New Image"** → Opens file picker (current behavior)
- **"Insert Existing Image"** → Opens image picker modal

#### Option B: Separate Buttons

- Keep existing image button for uploads
- Add new button "Insert from Gallery" with gallery icon

#### Option C: Unified Modal (Recommended)

Single image button opens modal with two tabs:
- **Tab 1: Upload** → Drag-and-drop upload interface
- **Tab 2: Gallery** → Grid of existing entity images

### 4.5 Image Selection Flow

1. User clicks "Insert Image" button
2. Modal opens with tabs: "Upload" | "Gallery"
3. User switches to "Gallery" tab
4. Displays grid of entity images (using `listEntityImages` API)
5. User clicks image to select
6. Image inserted as `entityImage` node at cursor position

---

## 5. Technical Implementation Requirements

### 5.1 Frontend Changes

#### 5.1.1 New Tiptap Extension

**File:** `src/components/ui/editor/entity-image-extension.tsx`

**Requirements:**
- Extend Tiptap `Node.create()`
- Define custom attributes (imageId, entityId, etc.)
- Use `ReactNodeViewRenderer` for React component
- Implement `parseHTML` and `renderHTML` for persistence
- Support keyboard navigation and selection

**Pattern to Follow:** `mention-extension-simple.tsx`

#### 5.1.2 Image Component

**File:** `src/components/ui/editor/entity-image-component.tsx`

**Requirements:**
- Render image using database ID
- Fetch image data (or receive via props)
- Construct URL: `${SERVER_URL}/${image.file_url}`
- Handle loading states, errors
- Support responsive sizing
- Optional: Click to open full-screen viewer

**Pattern to Follow:** `mention-component.tsx`

#### 5.1.3 Image Picker Modal

**File:** `src/components/ui/editor/image-picker-modal.tsx`

**Requirements:**
- Dialog/Modal component with tabs
- **Upload Tab:** Reuse `ImageUpload` component
- **Gallery Tab:**
  - Use `useListEntityImagesQuery` hook
  - Display image grid (similar to `ImageGrid`)
  - Selectable images (visual selection state)
  - Search/filter functionality
- **Actions:**
  - Insert button (disabled until image selected)
  - Cancel button

#### 5.1.4 Editor Integration

**File:** `src/components/ui/editor/index.tsx`

**Changes Required:**
1. Import and add `EntityImage` extension to extensions array
2. Update image button handler to open picker modal
3. Pass editor instance and cursor position to modal
4. Handle image selection callback

**Example:**
```typescript
const [imagePickerOpen, setImagePickerOpen] = React.useState(false);

// In toolbar
<Button onClick={() => setImagePickerOpen(true)}>
  <ImageIcon className="h-4 w-4" />
</Button>

// Modal
<ImagePickerModal
  open={imagePickerOpen}
  onOpenChange={setImagePickerOpen}
  gameId={gameId}
  entityId={entityId}
  entityType={entityType}
  onInsert={(image: Image) => {
    editor.chain().focus().insertEntityImage({
      imageId: image.id,
      entityId: image.entity_id,
      entityType: image.entity_type,
      gameId: gameId,
      alt: image.alt_text,
    }).run();
    setImagePickerOpen(false);
  }}
/>
```

### 5.2 Backend Changes

#### Option 1: No Backend Changes (Recommended for MVP)

- Images already have all required data
- File URLs are already publicly accessible
- No new API endpoints needed
- Frontend resolves image URLs at render time

#### Option 2: Add Image Resolution Endpoint (Future Enhancement)

**Endpoint:** `GET /games/:game_id/images/:image_id/resolve`

**Purpose:**
- Resolve image ID to current URL
- Handle image URL migrations
- Track image view analytics
- Support future CDN integration

**Response:**
```json
{
  "data": {
    "url": "http://localhost:4000/uploads/...",
    "alt_text": "...",
    "width": 1920,
    "height": 1080
  }
}
```

### 5.3 Database Changes

**No schema changes required** for MVP. Current `images` table has all necessary fields.

**Future Enhancement:** Add `usage_count` or `referenced_in` JSONB field to track where images are used.

---

## 6. Implementation Approach

### 6.1 Phase 1: MVP (Minimum Viable Product)

**Goal:** Enable basic insertion of existing images

**Scope:**
1. Create `EntityImage` Tiptap extension
2. Create `EntityImageComponent` renderer
3. Create simple image picker modal (gallery tab only)
4. Update editor toolbar to open modal
5. Test with existing images

**Timeline Estimate:** 1-2 days

**Files to Create:**
- `src/components/ui/editor/entity-image-extension.tsx`
- `src/components/ui/editor/entity-image-component.tsx`
- `src/components/ui/editor/image-picker-modal.tsx`

**Files to Modify:**
- `src/components/ui/editor/index.tsx` (add extension, update toolbar)

### 6.2 Phase 2: Enhanced UX

**Goal:** Improve user experience and feature parity

**Scope:**
1. Add upload tab to modal (unified interface)
2. Add image search/filter in gallery
3. Support image resizing in editor
4. Add keyboard shortcuts (e.g., Cmd+Shift+I)
5. Drag-and-drop from gallery to editor

**Timeline Estimate:** 2-3 days

### 6.3 Phase 3: Advanced Features

**Goal:** Production-ready with optimizations

**Scope:**
1. Image lazy loading in picker modal
2. Image caching strategy
3. Broken image handling (if image deleted)
4. Image alignment controls (left, center, right)
5. Image caption support
6. Analytics tracking
7. Migration script for existing content

**Timeline Estimate:** 3-5 days

---

## 7. Challenges and Edge Cases

### 7.1 Technical Challenges

#### Challenge 1: Image Deletion Handling

**Problem:** What happens if an image is deleted from the database but still referenced in editor content?

**Solutions:**
- **Option A (Soft Delete):** Don't actually delete images, mark as `deleted_at`
- **Option B (Broken Image Placeholder):** Show placeholder with "Image not found"
- **Option C (Validation):** Check for references before allowing deletion
- **Recommended:** Combination of B and C

**Implementation:**
```typescript
// In EntityImageComponent
const { data: image, isError } = useQuery({
  queryKey: ['image', imageId],
  queryFn: () => getEntityImage({ path: { id: imageId } }),
});

if (isError) {
  return <BrokenImagePlaceholder />;
}
```

#### Challenge 2: Image URL Construction

**Problem:** Image URLs need to be constructed dynamically from relative paths

**Solution:** Create utility function

```typescript
// src/utils/image.ts
export function getImageUrl(fileUrl: string): string {
  return `${SERVER_URL}/${fileUrl}`;
}
```

#### Challenge 3: Editor Content Migration

**Problem:** Existing editor content uses standard Image nodes with URLs

**Solutions:**
- **Option A (Dual Support):** Support both node types indefinitely
- **Option B (Migration Script):** Convert existing Image nodes to EntityImage nodes
- **Recommended:** Option A (no migration needed, backward compatible)

#### Challenge 4: Performance with Many Images

**Problem:** Loading hundreds of images in picker modal could be slow

**Solutions:**
- Implement pagination in image gallery
- Virtual scrolling for large lists
- Thumbnail generation (backend change required)
- Lazy loading images as user scrolls

### 7.2 UX Edge Cases

#### Edge Case 1: Cross-Entity Image References

**Question:** Should users be able to insert images from other entities?

**Current Scope:** No, only images from current entity
**Future Enhancement:** Add "Browse All Game Images" option

#### Edge Case 2: Image Upload During Editing

**Question:** If user uploads image while editing, should it auto-appear in gallery?

**Solution:** Yes, use TanStack Query's cache invalidation

```typescript
onSuccess: () => {
  queryClient.invalidateQueries(['listEntityImages', { gameId, entityType, entityId }]);
}
```

#### Edge Case 3: Multiple Users Editing

**Question:** What if one user deletes an image while another is viewing the picker?

**Solution:**
- Optimistic UI updates
- Refetch on window focus
- Show toast notification on error

### 7.3 Accessibility Considerations

1. **Alt Text:** Ensure all images have alt text
2. **Keyboard Navigation:** Full keyboard support in picker modal
3. **Screen Readers:** Proper ARIA labels
4. **Focus Management:** Return focus to editor after insertion

---

## 8. Testing Strategy

### 8.1 Unit Tests

- EntityImage extension attribute parsing
- Image URL construction utility
- Component rendering with valid/invalid image IDs

### 8.2 Integration Tests

- Image insertion workflow
- Image deletion with active references
- Modal open/close behavior
- Query invalidation on upload

### 8.3 E2E Tests

- Complete user flow: upload → insert → save → reload
- Image picker modal interaction
- Keyboard shortcuts

### 8.4 Manual Testing Checklist

- [ ] Insert existing image from gallery
- [ ] Upload new image and insert immediately
- [ ] Delete referenced image (verify broken state)
- [ ] Edit content with referenced images
- [ ] Save and reload page (verify persistence)
- [ ] View content in read-only mode
- [ ] Test with empty image gallery
- [ ] Test with 100+ images
- [ ] Test keyboard navigation
- [ ] Test mobile responsiveness

---

## 9. Migration Considerations

### 9.1 Backward Compatibility

**Requirement:** Existing content with standard Image nodes must continue to work

**Strategy:**
- Keep standard Tiptap Image extension enabled
- EntityImage is additive, not replacement
- No breaking changes to existing content

### 9.2 Future Migration Path

If desired, existing Image nodes can be migrated to EntityImage nodes:

**Migration Script Pseudocode:**
```typescript
async function migrateImagesToEntityImages() {
  const entities = await getAllEntities();

  for (const entity of entities) {
    if (!entity.content) continue;

    const content = JSON.parse(entity.content);
    const updatedContent = traverseAndMigrate(content, entity);

    await updateEntity(entity.id, {
      content: JSON.stringify(updatedContent)
    });
  }
}

function traverseAndMigrate(node, entity) {
  if (node.type === 'image') {
    // Find matching image in database by URL
    const image = findImageByUrl(node.attrs.src, entity);

    if (image) {
      return {
        type: 'entityImage',
        attrs: {
          imageId: image.id,
          entityId: entity.id,
          entityType: entity.type,
          gameId: entity.game_id,
          alt: node.attrs.alt,
        }
      };
    }
  }

  if (node.content) {
    node.content = node.content.map(child => traverseAndMigrate(child, entity));
  }

  return node;
}
```

---

## 10. Recommendations

### 10.1 Recommended Approach

**Implement Phase 1 (MVP) with the following priorities:**

1. ✅ **Create EntityImage Extension** following the mention pattern
2. ✅ **Build Image Picker Modal** with gallery view
3. ✅ **Integrate into Editor** toolbar
4. ✅ **Test with existing images**
5. ✅ **Document usage** for future developers

### 10.2 Key Design Decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Node type name | `entityImage` | Clear distinction from standard `image` |
| Reference method | Store image ID | Maintains referential integrity |
| UI approach | Modal with tabs | Unified, familiar interface |
| Backward compatibility | Support both types | No breaking changes |
| Image deletion | Broken image placeholder | Graceful degradation |
| Cross-entity images | Disabled initially | Simplifies first version |

### 10.3 Success Metrics

After implementation, measure:

1. **Reduced duplication:** Count of duplicate image files (should decrease)
2. **User adoption:** Percentage of images inserted via reference vs upload
3. **Storage savings:** Total disk space saved
4. **Error rate:** Broken image references (should be minimal)
5. **User satisfaction:** Feedback on new workflow

---

## 11. Alternative Solutions Considered

### 11.1 Alternative 1: URL Normalization

**Approach:** Keep standard Image nodes but detect and normalize URLs

**Pros:**
- Simpler implementation
- No custom extension needed

**Cons:**
- Doesn't prevent duplicates
- Fragile (URL changes break references)
- No metadata preservation
- Doesn't solve core problem

**Verdict:** ❌ Not recommended

### 11.2 Alternative 2: Server-Side Image Deduplication

**Approach:** Detect duplicate uploads on backend, return existing image

**Pros:**
- Transparent to frontend
- Prevents storage duplication

**Cons:**
- Still creates database records
- Complex deduplication logic
- Doesn't improve UX
- User still re-uploads unnecessarily

**Verdict:** ❌ Not recommended as primary solution (could be complementary)

### 11.3 Alternative 3: Markdown-Based Editor

**Approach:** Switch from Tiptap to Markdown editor with image references

**Pros:**
- Simpler content format
- Natural reference syntax

**Cons:**
- Major architectural change
- Loss of rich editing features
- Requires complete rewrite
- Markdown doesn't support custom nodes well

**Verdict:** ❌ Not feasible

---

## 12. Conclusion

### 12.1 Summary

The current implementation creates duplicate image records when users want to insert already-uploaded images into editor content. This research identifies that the root cause is the URL-based image storage in the editor, and proposes a **referenced image extension** following the proven pattern of the existing mention system.

### 12.2 Recommended Next Steps

1. **Approve approach** with product/engineering team
2. **Create design mockups** for image picker modal
3. **Implement Phase 1 (MVP)** following this specification
4. **Conduct user testing** with alpha users
5. **Iterate based on feedback**
6. **Roll out** to production

### 12.3 Estimated Impact

**Before Implementation:**
- User uploads image → Creates 1 database record
- User inserts same image in editor → Uploads again → Creates 2nd record
- **Result:** N duplicate records for same image

**After Implementation:**
- User uploads image → Creates 1 database record
- User inserts same image in editor → Selects from gallery → References existing record
- **Result:** 1 record, multiple references

**Expected Outcome:**
- 📉 50-70% reduction in duplicate image records
- 📉 30-50% reduction in storage usage
- 📈 Improved user experience
- 📈 Better content management

---

## Appendix A: Key File Locations

### Frontend Files

**Editor Core:**
- `src/components/ui/editor/index.tsx` - Main Tiptap editor
- `src/components/ui/editor/entity-editor.tsx` - Entity-specific wrapper
- `src/components/ui/editor/hooks.ts` - Content management hooks
- `src/components/ui/editor/utils.ts` - Content parsing utilities

**Image Components:**
- `src/components/ui/image-upload.tsx` - Image upload dropzone
- `src/components/images/image-gallery.tsx` - Image gallery display
- `src/components/images/image-grid.tsx` - Grid layout component
- `src/components/images/image-preview.tsx` - Individual image preview

**Mention System (Reference Pattern):**
- `src/components/ui/editor/mention-extension-simple.tsx` - Tiptap extension
- `src/components/ui/editor/mention-component.tsx` - React component
- `src/components/ui/editor/mention-list.tsx` - Suggestion list
- `src/components/ui/editor/mention-utils.ts` - Utilities

**API Layer:**
- `src/api/types.gen.ts` - Generated TypeScript types
- `src/api/sdk.gen.ts` - Generated API SDK
- `src/api/@tanstack/react-query.gen.ts` - Generated React Query hooks

### Backend Files (Reference Only)

**API Documentation:**
- `server/schema/swagger.json` - OpenAPI specification

**Image Endpoints:**
- Upload: `POST /games/:game_id/:entity_type/:entity_id/images`
- List: `GET /games/:game_id/:entity_type/:entity_id/images`
- Delete: `DELETE /games/:game_id/:entity_type/:entity_id/images/:id`
- Set Primary: `PUT /games/:game_id/:entity_type/:entity_id/images/:id/primary`

---

## Appendix B: Implementation Code Snippets

### B.1 EntityImage Extension Skeleton

```typescript
// src/components/ui/editor/entity-image-extension.tsx
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EntityImageComponent } from "./entity-image-component";

export interface EntityImageAttributes {
  imageId: string;
  entityId: string;
  entityType: string;
  gameId: string;
  alt?: string;
  width?: number;
  height?: number;
}

export const EntityImage = Node.create({
  name: "entityImage",

  group: "block",

  draggable: true,

  addAttributes() {
    return {
      imageId: { default: null },
      entityId: { default: null },
      entityType: { default: null },
      gameId: { default: null },
      alt: { default: null },
      width: { default: null },
      height: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="entityImage"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-type": "entityImage" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EntityImageComponent);
  },

  addCommands() {
    return {
      insertEntityImage: (attributes: EntityImageAttributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
        });
      },
    };
  },
});
```

### B.2 EntityImageComponent Skeleton

```typescript
// src/components/ui/editor/entity-image-component.tsx
import { NodeViewWrapper } from "@tiptap/react";
import type { ReactNodeViewProps } from "@tiptap/react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageOptions } from "~/api/@tanstack/react-query.gen";
import { SERVER_URL } from "~/routes/__root";

export const EntityImageComponent: React.FC<ReactNodeViewProps> = ({ node }) => {
  const { imageId, alt } = node.attrs;

  const { data: imageData, isLoading, isError } = useQuery({
    ...getImageOptions({ path: { id: imageId } }),
    enabled: !!imageId,
  });

  if (isLoading) {
    return <NodeViewWrapper><div>Loading image...</div></NodeViewWrapper>;
  }

  if (isError || !imageData?.data) {
    return <NodeViewWrapper><div>Image not found</div></NodeViewWrapper>;
  }

  const imageUrl = `${SERVER_URL}/${imageData.data.file_url}`;

  return (
    <NodeViewWrapper>
      <img
        src={imageUrl}
        alt={alt || imageData.data.alt_text || ""}
        className="editor-image"
      />
    </NodeViewWrapper>
  );
};
```

### B.3 Image Picker Modal Skeleton

```typescript
// src/components/ui/editor/image-picker-modal.tsx
import * as React from "react";
import { useListEntityImagesQuery } from "~/api/@tanstack/react-query.gen";
import type { Image } from "~/api";
import type { EntityType } from "~/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { ImageGrid } from "~/components/images/image-grid";

interface ImagePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  entityId: string;
  entityType: EntityType;
  onInsert: (image: Image) => void;
}

export function ImagePickerModal({
  open,
  onOpenChange,
  gameId,
  entityId,
  entityType,
  onInsert,
}: ImagePickerModalProps) {
  const [selectedImage, setSelectedImage] = React.useState<Image | null>(null);

  const { data: imagesData, isLoading } = useListEntityImagesQuery({
    path: { game_id: gameId, entity_type: entityType, entity_id: entityId },
  });

  const handleInsert = () => {
    if (selectedImage) {
      onInsert(selectedImage);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Insert Image</DialogTitle>

        {isLoading ? (
          <div>Loading images...</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {imagesData?.data?.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className={selectedImage?.id === image.id ? "selected" : ""}
              >
                <img src={`${SERVER_URL}/${image.file_url}`} alt={image.alt_text} />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!selectedImage}>
            Insert Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Appendix C: References and Resources

### Tiptap Documentation
- **Custom Extensions:** https://tiptap.dev/guide/custom-extensions
- **Node Views:** https://tiptap.dev/guide/node-views
- **React Integration:** https://tiptap.dev/guide/node-views/react
- **Commands:** https://tiptap.dev/api/commands

### Similar Implementations
- Notion: Uses image references with IDs
- Google Docs: Stores images by reference
- Confluence: Image library with references

### Related Issues/Discussions
- TanStack Query Invalidation: https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
- Base UI Components: https://base-ui.com/

---

**End of Report**
