'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Upload, ImagePlus, X, Star, GripVertical, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export interface ImageItem {
  id: string
  url: string
  thumbnail: string
  uploading?: boolean
  progress?: number
  fileSize?: string
  fileName?: string
}

interface ImageUploaderProps {
  images: ImageItem[]
  onChange: (images: ImageItem[]) => void
  maxImages?: number
  label?: string
  showPrimary?: boolean
  compact?: boolean
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface SortableImageProps {
  item: ImageItem
  index: number
  onRemove: (id: string) => void
  onSetPrimary: (id: string) => void
  isPrimary: boolean
  showPrimary: boolean
  compact?: boolean
}

function SortableImage({ item, onRemove, onSetPrimary, isPrimary, showPrimary, compact }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl overflow-hidden bg-cm-input border border-cm-border-subtle group
        ${isDragging ? 'opacity-50 scale-95 shadow-2xl shadow-red-500/10' : ''}
        ${compact ? 'aspect-square' : 'aspect-square'}`}
    >
      {/* Grip handle */}
      {!item.uploading && (
        <button
          {...attributes}
          {...listeners}
          className="absolute top-1 left-1 z-10 w-6 h-6 rounded-md bg-cm-overlay flex items-center justify-center text-cm-muted hover:text-white hover:bg-cm-hover-strong cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Image or loading */}
      {item.url ? (
        <img
          src={item.thumbnail || item.url}
          alt={item.fileName || 'Uploaded image'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
          <Loader2 className="w-6 h-6 text-cm-dim animate-spin" />
          {!compact && item.fileSize && (
            <span className="text-[10px] text-cm-faint">{item.fileSize}</span>
          )}
        </div>
      )}

      {/* Upload progress overlay */}
      {item.uploading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="w-full px-3">
            <div className="w-full h-1.5 bg-cm-hover-strong rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-300"
                style={{ width: `${item.progress || 0}%` }}
              />
            </div>
            <p className="text-[10px] text-cm-muted text-center mt-1.5">
              {Math.round(item.progress || 0)}%
            </p>
          </div>
        </div>
      )}

      {/* Primary badge */}
      {isPrimary && item.url && !item.uploading && showPrimary && (
        <div className="absolute top-1 right-1 z-10 px-1.5 py-0.5 rounded-md bg-red-600 text-[9px] text-white font-semibold flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-white" /> Main
        </div>
      )}

      {/* File size badge */}
      {item.fileSize && item.url && !item.uploading && !compact && (
        <div className="absolute bottom-1 left-1 z-10 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] text-cm-muted font-mono">
          {item.fileSize}
        </div>
      )}

      {/* Action buttons on hover */}
      {item.url && !item.uploading && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
          {showPrimary && !isPrimary && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetPrimary(item.id) }}
              className="w-8 h-8 rounded-full bg-cm-overlay flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              title="Set as main image"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(item.id) }}
            className="w-8 h-8 rounded-full bg-cm-overlay flex items-center justify-center text-white hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 5,
  label = 'Images',
  showPrimary = true,
  compact = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<ImageItem[]>(images)
  useEffect(() => { imagesRef.current = images }, [images])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const uploadFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Use JPEG, PNG, WebP, or GIF.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} image${maxImages > 1 ? 's' : ''} allowed`)
      return
    }

    const tempId = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const newImg: ImageItem = {
      id: tempId,
      url: '',
      thumbnail: '',
      uploading: true,
      progress: 0,
      fileSize: formatFileSize(file.size),
      fileName: file.name,
    }
    const updatedImages = [...images, newImg]
    onChange(updatedImages)
    imagesRef.current = updatedImages

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      let progress = 0
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 25, 85)
        const current = imagesRef.current.map(img =>
          img.id === tempId ? { ...img, progress } : img
        )
        imagesRef.current = current
        onChange(current)
      }, 200)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()

      // Replace the temp item with the real one, keep same id for dnd-kit
      const finalImages = imagesRef.current.map(img =>
        img.id === tempId
          ? { ...img, url: data.url, thumbnail: data.thumbnail, uploading: false, progress: 100 }
          : img
      )
      imagesRef.current = finalImages
      onChange(finalImages)
    } catch (err: any) {
      // Remove the failed upload
      const filtered = imagesRef.current.filter(img => img.id !== tempId)
      imagesRef.current = filtered
      onChange(filtered)
      toast.error(err.message || 'Failed to upload image')
    }
  }, [images, maxImages, onChange])

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    const remaining = maxImages - images.length
    const toUpload = Array.from(files).slice(0, remaining)
    if (files.length > remaining) {
      toast.warning(`Only ${remaining} more image${remaining !== 1 ? 's' : ''} allowed`)
    }
    toUpload.forEach(file => uploadFile(file))
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.id === active.id)
      const newIndex = images.findIndex(img => img.id === over.id)
      onChange(arrayMove(images, oldIndex, newIndex))
    }
  }

  const removeImage = (id: string) => {
    onChange(images.filter(img => img.id !== id))
  }

  const setPrimary = (id: string) => {
    const img = images.find(i => i.id === id)
    if (!img) return
    const rest = images.filter(i => i.id !== id)
    onChange([img, ...rest])
  }

  const primaryId = images[0]?.id

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-cm-secondary">{label}</h2>
        <span className="text-xs text-cm-dim">
          {images.filter(i => !i.uploading).length}/{maxImages} {label.toLowerCase()}
        </span>
      </div>

      {/* Drag & Drop Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            isDragging
              ? 'border-red-500 bg-red-500/5'
              : 'border-cm-border-hover hover:border-red-500/30 hover:bg-cm-hover'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <ImagePlus className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-red-400' : 'text-cm-faint'}`} />
          <p className="text-sm text-cm-muted">
            {isDragging ? 'Drop images here' : 'Drag & drop images here'}
          </p>
          <p className="text-xs text-cm-faint mt-1">
            or click to browse · JPEG, PNG, WebP, GIF · Max 5MB each
          </p>
        </div>
      )}

      {/* Sortable Image Grid */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className={`grid gap-3 ${
              compact
                ? 'grid-cols-2 sm:grid-cols-3'
                : images.length === 1 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
            }`}>
              {images.map((img) => (
                <SortableImage
                  key={img.id}
                  item={img}
                  index={images.indexOf(img)}
                  onRemove={removeImage}
                  onSetPrimary={setPrimary}
                  isPrimary={img.id === primaryId}
                  showPrimary={showPrimary}
                  compact={compact}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showPrimary && images.length > 1 && (
        <p className="text-xs text-cm-faint">
          First image is the main photo. Drag to reorder or click the <Star className="w-3 h-3 inline -mt-0.5" /> icon to set a new main image.
        </p>
      )}
    </div>
  )
}
