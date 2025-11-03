"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, ImageIcon } from "lucide-react"

type PrintSize = "4x6" | "5x7" | "8x10"

interface Photo {
  id: string
  file: File
  preview: string
  size: PrintSize
}

const PRICES: Record<PrintSize, number> = {
  "4x6": 1.5,
  "5x7": 3,
  "8x10": 5,
}

export default function PhotoPrintingPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newPhotos: Photo[] = []
    const remainingSlots = 5 - photos.length

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i]
      if (file.type.startsWith("image/")) {
        newPhotos.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          size: "4x6",
        })
      }
    }

    setPhotos([...photos, ...newPhotos])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removePhoto = (id: string) => {
    setPhotos(photos.filter((photo) => photo.id !== id))
  }

  const updatePhotoSize = (id: string, size: PrintSize) => {
    setPhotos(photos.map((photo) => (photo.id === id ? { ...photo, size } : photo)))
  }

  const calculateTotal = () => {
    return photos.reduce((total, photo) => total + PRICES[photo.size], 0)
  }

  const handlePayment = () => {
    alert(`Payment successful! Total: AED ${calculateTotal().toFixed(2)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-sans text-3xl font-bold text-foreground md:text-4xl">Photo Printing Service</h1>
          <p className="text-muted-foreground">Upload your photos and choose your print size</p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8 p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-accent" : "border-border"
            }`}
          >
            <input
              type="file"
              id="photo-upload"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={photos.length >= 5}
            />
            <label
              htmlFor="photo-upload"
              className={`flex cursor-pointer flex-col items-center gap-3 ${
                photos.length >= 5 ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="mb-1 font-medium text-foreground">
                  {photos.length >= 5 ? "Maximum photos reached" : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-muted-foreground">{photos.length}/5 photos uploaded</p>
              </div>
            </label>
          </div>
        </Card>

        {/* Photos Grid */}
        {photos.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 font-sans text-xl font-semibold text-foreground">Your Photos</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden pt-0">
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={photo.preview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-fit object-cover"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-lg transition-transform hover:scale-110"
                      aria-label="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <label className="mb-2 block text-sm font-medium text-foreground">Print Size</label>
                    <Select value={photo.size} onValueChange={(value) => updatePhotoSize(photo.id, value as PrintSize)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4x6">4×6 - AED 1.50</SelectItem>
                        <SelectItem value="5x7">5×7 - AED 3.00</SelectItem>
                        <SelectItem value="8x10">8×10 - AED 5.00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {photos.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No photos uploaded yet</p>
          </div>
        )}

        {/* Checkout Section */}
        {photos.length > 0 && (
          <Card className="p-6">
            <div className="mb-6 space-y-3">
              <h2 className="font-sans text-xl font-semibold text-foreground">Order Summary</h2>
              <div className="space-y-2">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Photo {index + 1} ({photo.size})
                    </span>
                    <span className="font-medium text-foreground">AED {PRICES[photo.size].toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary text-xl">AED {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Button onClick={handlePayment} className="w-full" size="lg">
              Pay Now
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
