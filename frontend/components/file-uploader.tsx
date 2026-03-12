"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, CheckCircle2, AlertCircle, FileText, Video, Music, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { uploadToFirebase, generatePath, detectType, type ProgressCallback } from "@/lib/firebase"

type FileUploaderProps = {
  orgId: string
  userId: string
  categoryId: string
  onUploadComplete?: (content: any) => void
}

type UploadState = {
  fileName: string
  progress: number
  status: "idle" | "uploading" | "processing" | "done" | "error"
  error?: string
}

export function FileUploader({ orgId, userId, categoryId, onUploadComplete }: FileUploaderProps) {
  const [upload, setUpload] = useState<UploadState | null>(null)

  const handleProgress: ProgressCallback = pct => {
    setUpload(prev =>
      prev
        ? {
            ...prev,
            progress: pct,
            status: pct >= 100 ? "processing" : "uploading",
          }
        : prev,
    )
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return
      const file = acceptedFiles[0]

      const fileType = detectType(file.type || "", file.name)
      const path = generatePath(orgId, fileType, file.name)

      setUpload({
        fileName: file.name,
        progress: 0,
        status: "uploading",
      })

      try {
        const { url, path: storedPath } = await uploadToFirebase(file, path, handleProgress)

        // Save metadata to Supabase via /api/upload
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            categoryId,
            userId,
            title: file.name.replace(/\.[^/.]+$/, ""),
            fileType,
            fileName: file.name,
            mimeType: file.type || null,
            firebaseUrl: url,
            firebasePath: storedPath,
            fileSize: file.size,
          }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error || "Failed to save content")
        }

        const body = await res.json()
        const content = body.content ?? body

        setUpload(prev =>
          prev
            ? {
                ...prev,
                progress: 100,
                status: "done",
              }
            : prev,
        )

        toast.success("Content uploaded — employees can now see it live!")
        onUploadComplete?.(content)
      } catch (e: any) {
        console.error("File upload error:", e)
        setUpload(prev =>
          prev
            ? {
                ...prev,
                status: "error",
                error: e?.message || "Upload failed",
              }
            : prev,
        )
        toast.error("Upload failed. Please try again.")
      }
    },
    [orgId, userId, categoryId, onUploadComplete],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  })

  const renderIcon = () => {
    if (!upload) {
      return <Upload className="w-6 h-6 text-[#FF6B35]" />
    }
    if (upload.status === "done") {
      return <CheckCircle2 className="w-6 h-6 text-emerald-500" />
    }
    if (upload.status === "error") {
      return <AlertCircle className="w-6 h-6 text-red-500" />
    }
    return <Upload className="w-6 h-6 text-[#FF6B35]" />
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
          isDragActive
            ? "border-[#FF6B35] bg-[#FFF4ED]"
            : "border-[#E7E5E4] bg-[#FAF9F7] hover:border-[#FF6B35]/60 hover:bg-[#FFF4ED]"
        }`}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B35]/15 to-[#C8A96E]/15"
        >
          {renderIcon()}
        </motion.div>
        <p className="text-sm font-semibold text-[#1C1917]">
          Drag and drop a file here, or{" "}
          <span className="text-[#FF6B35] underline-offset-2 group-hover:underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-[#78716C]">
          Supported: video, PDF, audio, images, docs. Max 500 MB.
        </p>

        <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-[#A8A29E]">
          <div className="flex items-center gap-1">
            <Video className="h-3.5 w-3.5" />
            <span>Training videos</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            <span>PDF / Docs</span>
          </div>
          <div className="flex items-center gap-1">
            <Music className="h-3.5 w-3.5" />
            <span>Audio</span>
          </div>
          <div className="flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Images</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {upload && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl border border-[#E7E5E4] bg-white px-4 py-3 text-xs text-[#1C1917]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{upload.fileName}</p>
                <p className="mt-0.5 text-[11px] text-[#78716C]">
                  {upload.status === "uploading" && "Uploading to Arambh…"}
                  {upload.status === "processing" && "Processing and making it searchable…"}
                  {upload.status === "done" && "Ready. Employees can access this now."}
                  {upload.status === "error" && upload.error}
                </p>
              </div>
              <span className="text-[11px] font-medium text-[#FF6B35]">
                {Math.round(upload.progress)}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F5F5F4]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] via-[#E85520] to-[#C8A96E]"
                initial={{ width: 0 }}
                animate={{ width: `${upload.progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

