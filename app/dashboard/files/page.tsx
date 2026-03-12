"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Upload, Search, Filter, MoreVertical, FileText, Video, Music, Image as ImageIcon,
  Folder, FolderPlus, Download, Trash2, Eye, Share2, X, ChevronRight,
  Grid3X3, List, Clock, HardDrive, CheckCircle2, AlertCircle
} from "lucide-react"

type FileItem = {
  id: string
  name: string
  type: "pdf" | "video" | "audio" | "image" | "document"
  size: string
  uploadedBy: string
  uploadedAt: string
  folder: string
}

type FolderItem = {
  id: string
  name: string
  fileCount: number
  color: string
}

const initialFolders: FolderItem[] = [
  { id: "1", name: "HR Documents", fileCount: 12, color: "#FF6B35" },
  { id: "2", name: "Training Videos", fileCount: 8, color: "#10B981" },
  { id: "3", name: "Product Guides", fileCount: 15, color: "#6366F1" },
  { id: "4", name: "Compliance", fileCount: 5, color: "#F59E0B" },
]

const initialFiles: FileItem[] = [
  { id: "1", name: "Employee Handbook 2024.pdf", type: "pdf", size: "2.4 MB", uploadedBy: "Admin", uploadedAt: "2 days ago", folder: "HR Documents" },
  { id: "2", name: "Onboarding Welcome.mp4", type: "video", size: "156 MB", uploadedBy: "HR Team", uploadedAt: "5 days ago", folder: "Training Videos" },
  { id: "3", name: "Product Demo.mp4", type: "video", size: "89 MB", uploadedBy: "Product", uploadedAt: "1 week ago", folder: "Product Guides" },
  { id: "4", name: "Sales Presentation.pdf", type: "pdf", size: "4.8 MB", uploadedBy: "Sales", uploadedAt: "3 days ago", folder: "Product Guides" },
  { id: "5", name: "Company Logo.png", type: "image", size: "256 KB", uploadedBy: "Design", uploadedAt: "2 weeks ago", folder: "HR Documents" },
  { id: "6", name: "Podcast Episode 1.mp3", type: "audio", size: "45 MB", uploadedBy: "Marketing", uploadedAt: "1 day ago", folder: "Training Videos" },
  { id: "7", name: "GDPR Compliance Guide.pdf", type: "pdf", size: "1.2 MB", uploadedBy: "Legal", uploadedAt: "3 weeks ago", folder: "Compliance" },
  { id: "8", name: "Benefits Overview.docx", type: "document", size: "890 KB", uploadedBy: "HR Team", uploadedAt: "4 days ago", folder: "HR Documents" },
]

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>(initialFiles)
  const [folders] = useState<FolderItem[]>(initialFolders)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = !selectedFolder || file.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText size={20} className="text-red-500" />
      case "video": return <Video size={20} className="text-purple-500" />
      case "audio": return <Music size={20} className="text-green-500" />
      case "image": return <ImageIcon size={20} className="text-blue-500" />
      default: return <FileText size={20} className="text-gray-500" />
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Simulate upload
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setUploadProgress(null), 1000)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [])

  const toggleFileSelection = (id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleDelete = (id: string) => {
    setFiles(files.filter(f => f.id !== id))
  }

  const totalStorage = "2.4 GB"
  const usedStorage = "1.8 GB"
  const storagePercent = 75

  return (
    <div 
      className="p-8 min-h-screen"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#FF6B35]/10 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-12 border-2 border-dashed border-[#FF6B35] text-center"
            >
              <Upload size={48} className="mx-auto text-[#FF6B35] mb-4" />
              <h3 className="text-xl font-bold text-[#1C1917]">Drop files here</h3>
              <p className="text-[#78716C] mt-2">Release to upload your files</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload progress toast */}
      <AnimatePresence>
        {uploadProgress !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-white rounded-2xl shadow-2xl p-4 w-80 z-50 border border-[#E7E5E4]"
          >
            <div className="flex items-center gap-3 mb-3">
              {uploadProgress < 100 ? (
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                  <Upload size={20} className="text-[#FF6B35] animate-pulse" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-[#1C1917]">
                  {uploadProgress < 100 ? "Uploading files..." : "Upload complete!"}
                </p>
                <p className="text-sm text-[#78716C]">
                  {uploadProgress}% complete
                </p>
              </div>
            </div>
            <div className="h-2 bg-[#E7E5E4] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#FF6B35] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1917]">File Library</h1>
          <p className="text-[#78716C] mt-1">Manage all your uploaded content</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B35] text-white font-medium rounded-xl hover:bg-[#E85520] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload size={18} />
            Upload Files
          </motion.button>
        </div>
      </div>

      {/* Storage info */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
              <HardDrive size={20} className="text-[#FF6B35]" />
            </div>
            <div>
              <p className="font-semibold text-[#1C1917]">Storage</p>
              <p className="text-sm text-[#78716C]">{usedStorage} of {totalStorage} used</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-[#1C1917]">{storagePercent}%</span>
        </div>
        <div className="h-2 bg-[#E7E5E4] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ 
              background: storagePercent > 80 
                ? 'linear-gradient(90deg, #F59E0B, #EF4444)' 
                : 'linear-gradient(90deg, #FF6B35, #C8A96E)' 
            }}
            initial={{ width: 0 }}
            animate={{ width: `${storagePercent}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Folders */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1C1917]">Folders</h3>
              <button className="p-1.5 hover:bg-[#F5F5F4] rounded-lg transition-colors">
                <FolderPlus size={18} className="text-[#78716C]" />
              </button>
            </div>

            <button
              onClick={() => setSelectedFolder(null)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors mb-2 ${
                selectedFolder === null ? "bg-[#FF6B35]/10 text-[#FF6B35]" : "hover:bg-[#F5F5F4] text-[#1C1917]"
              }`}
            >
              <Folder size={18} />
              <span className="flex-1 text-left text-sm font-medium">All Files</span>
              <span className="text-xs text-[#78716C]">{files.length}</span>
            </button>

            {folders.map((folder) => (
              <motion.button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  selectedFolder === folder.name ? "bg-[#FF6B35]/10" : "hover:bg-[#F5F5F4]"
                }`}
                whileHover={{ x: 4 }}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${folder.color}20` }}
                >
                  <Folder size={16} style={{ color: folder.color }} />
                </div>
                <span className={`flex-1 text-left text-sm font-medium ${
                  selectedFolder === folder.name ? "text-[#FF6B35]" : "text-[#1C1917]"
                }`}>
                  {folder.name}
                </span>
                <span className="text-xs text-[#78716C]">{folder.fileCount}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C]" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-white border border-[#E7E5E4] rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#FF6B35] text-white" : "text-[#78716C] hover:bg-[#F5F5F4]"}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#FF6B35] text-white" : "text-[#78716C] hover:bg-[#F5F5F4]"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <button 
              onClick={() => setSelectedFolder(null)}
              className="text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              All Files
            </button>
            {selectedFolder && (
              <>
                <ChevronRight size={14} className="text-[#78716C]" />
                <span className="text-[#1C1917] font-medium">{selectedFolder}</span>
              </>
            )}
          </div>

          {/* Files */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredFiles.map((file, i) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group bg-white rounded-2xl border p-4 cursor-pointer transition-all ${
                      selectedFiles.includes(file.id) 
                        ? "border-[#FF6B35] shadow-lg shadow-[#FF6B35]/10" 
                        : "border-[#E7E5E4] hover:border-[#FF6B35]/30"
                    }`}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <div className="h-24 bg-[#F9FAFB] rounded-xl flex items-center justify-center mb-3 relative">
                      {getFileIcon(file.type)}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(file.id) }}
                          className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-medium text-[#1C1917] text-sm truncate">{file.name}</h4>
                    <div className="flex items-center justify-between mt-2 text-xs text-[#78716C]">
                      <span>{file.size}</span>
                      <span>{file.uploadedAt}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="w-8 px-4 py-3">
                      <input type="checkbox" className="rounded border-[#E7E5E4]" />
                    </th>
                    <th className="text-left text-xs font-semibold text-[#78716C] uppercase tracking-wider px-4 py-3">Name</th>
                    <th className="text-left text-xs font-semibold text-[#78716C] uppercase tracking-wider px-4 py-3">Size</th>
                    <th className="text-left text-xs font-semibold text-[#78716C] uppercase tracking-wider px-4 py-3">Uploaded By</th>
                    <th className="text-left text-xs font-semibold text-[#78716C] uppercase tracking-wider px-4 py-3">Date</th>
                    <th className="text-right text-xs font-semibold text-[#78716C] uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredFiles.map((file, i) => (
                      <motion.tr
                        key={file.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-[#E7E5E4] hover:bg-[#F9FAFB] transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox" 
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => toggleFileSelection(file.id)}
                            className="rounded border-[#E7E5E4]" 
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] flex items-center justify-center">
                              {getFileIcon(file.type)}
                            </div>
                            <span className="font-medium text-[#1C1917]">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#78716C]">{file.size}</td>
                        <td className="px-4 py-3 text-sm text-[#78716C]">{file.uploadedBy}</td>
                        <td className="px-4 py-3 text-sm text-[#78716C]">{file.uploadedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-[#E7E5E4] rounded-lg transition-colors">
                              <Eye size={16} className="text-[#78716C]" />
                            </button>
                            <button className="p-2 hover:bg-[#E7E5E4] rounded-lg transition-colors">
                              <Download size={16} className="text-[#78716C]" />
                            </button>
                            <button className="p-2 hover:bg-[#E7E5E4] rounded-lg transition-colors">
                              <Share2 size={16} className="text-[#78716C]" />
                            </button>
                            <button 
                              onClick={() => handleDelete(file.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E7E5E4] flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1C1917]">Upload Files</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-[#F5F5F4] rounded-lg transition-colors"
                >
                  <X size={20} className="text-[#78716C]" />
                </button>
              </div>

              <div className="p-6">
                <div className="border-2 border-dashed border-[#E7E5E4] rounded-2xl p-12 text-center hover:border-[#FF6B35] transition-colors cursor-pointer">
                  <Upload size={48} className="mx-auto text-[#78716C] mb-4" />
                  <h3 className="text-lg font-semibold text-[#1C1917] mb-2">
                    Drag and drop files here
                  </h3>
                  <p className="text-[#78716C] mb-4">or click to browse</p>
                  <input type="file" className="hidden" multiple />
                  <button className="px-6 py-2.5 bg-[#FF6B35] text-white font-medium rounded-xl hover:bg-[#E85520] transition-colors">
                    Browse Files
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-[#1C1917] mb-2">
                    Select Folder
                  </label>
                  <select className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35]">
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.name}>{folder.name}</option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-[#78716C] mt-4">
                  Supported formats: PDF, DOC, DOCX, MP4, MP3, PNG, JPG (max 500MB per file)
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
