# Image Viewer Module

A comprehensive, reusable image viewing solution with zoom, pan, and modal capabilities built for React applications.

## Features

- 🔍 **Smart Zoom** - Click to cycle through 100% → 200% → 300% → reset
- 🖱️ **Smooth Panning** - Drag to pan when zoomed, with boundary constraints
- ⚡ **Responsive Sizing** - Dialog adapts to image dimensions and zoom level
- 🎯 **Multiple APIs** - From simple drop-in components to advanced hooks
- 📱 **Touch Friendly** - Optimized for mobile and desktop interactions
- ♿ **Accessible** - Proper ARIA labels and keyboard navigation
- 🎨 **Customizable** - Extensive configuration options

## Quick Start

### Simple Modal (90% of use cases)

```tsx
import { ImageModal } from "~/lib/image-viewer";

function MyComponent() {
  const [selectedImage, setSelectedImage] = useState(null);
  
  return (
    <>
      <button onClick={() => setSelectedImage(image)}>
        View Image
      </button>
      
      <ImageModal 
        image={selectedImage} 
        isOpen={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      />
    </>
  );
}
```

### Embedded Viewer

```tsx
import { ImageViewer } from "~/lib/image-viewer";

function Gallery() {
  return (
    <div className="h-96">
      <ImageViewer image={image} />
    </div>
  );
}
```

## API Reference

### Components

#### `<ImageModal />`

A complete modal solution with zoom, pan, and responsive sizing.

```tsx
interface ImageModalProps {
  image: Image;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  config?: ImageViewerConfig;
}
```

**Props:**
- `image` - Image object with `file_url` and `alt_text`
- `isOpen` - Controls modal visibility
- `onOpenChange` - Callback when modal should close
- `config` - Optional configuration (see Configuration)

#### `<ImageViewer />`

Embeddable image viewer for use within your own containers.

```tsx
interface ImageViewerProps {
  image: Image;
  config?: ImageViewerConfig;
  className?: string;
  onZoomChange?: (zoom: number) => void;
  onImageLoad?: (dimensions: ImageDimensions) => void;
}
```

#### `<ImageContainer />`

Minimal responsive image container without zoom/pan functionality.

```tsx
interface ImageContainerProps {
  image: Image;
  className?: string;
  children?: React.ReactNode;
}
```

### Hooks

#### `useImageViewer(options)`

Advanced hook for building custom image viewers.

```tsx
const viewer = useImageViewer({
  image,
  config: { maxZoom: 5 },
  onZoomChange: (zoom) => console.log('Zoom:', zoom),
});

return (
  <Dialog>
    <DialogContent style={viewer.dialogSize}>
      {viewer.render()}
    </DialogContent>
  </Dialog>
);
```

**Returns:**
- `state` - Current zoom, position, dimensions, loading state
- `actions` - setZoom, setPosition, resetView, zoomIn, zoomOut
- `dialogSize` - Calculated optimal dialog dimensions
- `containerProps` - Props for the container element
- `render()` - Function that returns the complete viewer UI

#### `useZoomPan(options)`

Lower-level hook for zoom and pan functionality only.

```tsx
const zoomPan = useZoomPan({
  imageDimensions,
  config: { enablePan: true, enableZoom: true },
  onZoomChange: (zoom) => setZoom(zoom),
});
```

#### `useImageSizing(options)`

Hook for calculating optimal dialog dimensions.

```tsx
const dialogSize = useImageSizing({
  imageDimensions,
  zoom,
  config: { maxDisplayWidth: 1200 },
});
```

## Configuration

### `ImageViewerConfig`

```tsx
interface ImageViewerConfig {
  maxZoom?: number;           // Default: 3
  minZoom?: number;           // Default: 0.5
  enablePan?: boolean;        // Default: true
  enableZoom?: boolean;       // Default: true
  zoomSteps?: number[];       // Default: [1, 2, 3]
  maxDisplayWidth?: number;   // Default: 1200
  maxDisplayHeight?: number;  // Default: 800
}
```

### Examples

**Disable panning:**
```tsx
<ImageModal 
  image={image} 
  config={{ enablePan: false }}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
/>
```

**Custom zoom levels:**
```tsx
<ImageViewer 
  image={image}
  config={{ 
    zoomSteps: [1, 1.5, 2, 4],
    maxZoom: 4 
  }}
/>
```

**Larger display size:**
```tsx
<ImageModal 
  image={image}
  config={{ 
    maxDisplayWidth: 1600,
    maxDisplayHeight: 1200 
  }}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
/>
```

## Advanced Usage

### Custom Modal Layout

```tsx
import { useImageViewer } from "~/lib/image-viewer";

function CustomImageModal({ image, isOpen, onOpenChange }) {
  const viewer = useImageViewer({ image });
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent style={viewer.dialogSize}>
        {/* Custom header */}
        <div className="flex justify-between items-center p-4">
          <h2>{image.title}</h2>
          <button onClick={() => viewer.actions.resetView()}>
            Reset
          </button>
        </div>
        
        {/* Image viewer */}
        <div {...viewer.containerProps}>
          {viewer.render()}
        </div>
        
        {/* Custom footer */}
        <div className="p-4 border-t">
          <p>Zoom: {Math.round(viewer.state.zoom * 100)}%</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Gallery with Thumbnails

```tsx
function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);
  
  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        {images.map(image => (
          <ImageContainer 
            key={image.id}
            image={image}
            className="aspect-square cursor-pointer hover:opacity-80"
            onClick={() => setSelectedImage(image)}
          />
        ))}
      </div>
      
      {selectedImage && (
        <ImageModal 
          image={selectedImage}
          isOpen={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
```

### Controlled Zoom

```tsx
function ControlledImageViewer({ image }) {
  const [zoom, setZoom] = useState(1);
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setZoom(1)}>100%</button>
        <button onClick={() => setZoom(2)}>200%</button>
        <button onClick={() => setZoom(3)}>300%</button>
      </div>
      
      <div className="h-96">
        <ImageViewer 
          image={image}
          onZoomChange={setZoom}
          config={{ zoomSteps: [zoom] }} // Force specific zoom
        />
      </div>
    </div>
  );
}
```

## Interactions

### Mouse/Trackpad
- **Click** - Cycle through zoom levels (100% → 200% → 300% → reset)
- **Drag** - Pan around when zoomed (> 100%)
- **Ctrl/Cmd + Scroll** - Smooth zoom in/out
- **Scroll** - Pan horizontally/vertically when zoomed

### Touch (Mobile)
- **Tap** - Cycle through zoom levels
- **Drag** - Pan around when zoomed
- **Pinch** - Zoom in/out (if supported by browser)

### Keyboard
- **Escape** - Close modal
- **Space** - Cycle zoom levels (when focused)

## Performance Notes

- Images are lazy-loaded with `loading="lazy"`
- Drag interactions use `requestAnimationFrame` for smooth performance
- State management uses refs to avoid unnecessary re-renders during dragging
- Dialog sizing is memoized and only recalculates when necessary

## Migration from Legacy Components

### Before (Old image-grid.tsx)
```tsx
// 50+ lines of setup code
const [zoom, setZoom] = useState(1);
const [imageDimensions, setImageDimensions] = useState(null);
const dialogSize = useImageDialogSize({ imageDimensions, zoom, padding: zoom > 1 ? 80 : 140 });
// ... lots more setup

<Dialog>
  <DialogContent style={dialogSize}>
    <ImageViewer onZoomChange={setZoom} onImageDimensionsChange={setImageDimensions} />
  </DialogContent>
</Dialog>
```

### After (New API)
```tsx
// 3 lines, zero setup
<ImageModal 
  image={image} 
  isOpen={isOpen} 
  onOpenChange={setIsOpen} 
/>
```

## Browser Support

- **Modern browsers** - Full functionality including smooth zoom/pan
- **Safari** - Full support with optimized touch handling  
- **Mobile browsers** - Touch-optimized interactions
- **IE11** - Basic functionality (no smooth transitions)

## Troubleshooting

### Image not loading
- Check that `VITE_SERVER_URL` environment variable is set correctly
- Verify image `file_url` is valid and accessible

### Poor zoom/pan performance
- Ensure images are reasonably sized (< 10MB)
- Check for conflicting CSS that might interfere with transforms
- Disable other scroll event listeners that might conflict

### Modal sizing issues
- Verify dialog container has proper overflow settings
- Check for conflicting global CSS affecting dialog positioning
- Ensure viewport meta tag is properly configured for mobile