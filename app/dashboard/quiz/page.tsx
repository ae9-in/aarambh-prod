"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, Search, AlertCircle } from "lucide-react"
import { useApp } from "@/lib/store"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CountUp from "react-countup"

const easeExpo = [0.16, 1, 0.3, 1]

interface Question { text: string; type: "mcq" | "fill" | "truefalse"; options?: string[]; correct?: string | number; answer?: string }

export default function QuizPage() {
  const { state, dispatch } = useApp()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [tab, setTab] = useState("manual")
  const [formData, setFormData] = useState({ title: "", lessonId: "", questions: [] as Question[], timeLimit: 10, passPercent: 70 })
  const [currentQ, setCurrentQ] = useState({ text: "", type: "mcq" as const, options: ["", "", "", ""], correct: 0 })

  useEffect(() => setTimeout(() => setIsLoading(false), 500), [])

  const allQuizzes = state.quizzes ?? []
  const quizzes = allQuizzes.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddQuestion = () => {
    if (!currentQ.text.trim()) { toast.error("Enter question text"); return }
    setFormData(prev => ({ ...prev, questions: [...prev.questions, currentQ] }))
    setCurrentQ({ text: "", type: "mcq", options: ["", "", "", ""], correct: 0 })
    toast.success("Question added")
  }

  const handleSaveQuiz = () => {
    if (!formData.title.trim() || formData.questions.length === 0) { toast.error("Title and questions required"); return }
    dispatch({ type: "ADD_QUIZ", payload: { id: Date.now().toString(), ...formData, difficulty: "Medium", avgScore: 0, completionCount: 0, lastScore: null } })
    toast.success("Quiz created!")
    setIsCreateOpen(false)
    setFormData({ title: "", lessonId: "", questions: [], timeLimit: 10, passPercent: 70 })
  }

  const handleDeleteQuiz = (id: string) => {
    dispatch({ type: "REMOVE_QUIZ", payload: id })
    toast.success("Quiz deleted")
  }

  if (isLoading) return <div className="h-40 bg-[#E7E5E4] rounded-lg animate-pulse" />

  return (
    <div className="space-y-6">
      <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo }}>
        <div><h1 className="text-3xl font-bold text-[#1C1917]">Quizzes</h1><p className="text-[#78716C] mt-1">Create and manage assessments</p></div>
        <motion.button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B35] text-white rounded-xl font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Plus size={18} /> Create Quiz</motion.button>
      </motion.div>

      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {[{ label: "Total Quizzes", value: allQuizzes.length }, { label: "Published", value: allQuizzes.length }, { label: "Avg Score", value: 78 }, { label: "Completions", value: allQuizzes.reduce((a, q) => a + (q.completionCount || 0), 0) }].map((stat, i) => (
          <motion.div key={stat.label} className="bg-white rounded-xl border border-[#E7E5E4] p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <p className="text-sm text-[#78716C]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1C1917] mt-1"><CountUp end={stat.value} duration={1} /></p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="flex gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C]" /><input type="text" placeholder="Search quizzes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#FF6B35]/20 outline-none" /></div>
      </motion.div>

      <motion.div className="grid gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <AnimatePresence>
          {quizzes.map((quiz, idx) => (
            <motion.div key={quiz.id} className="bg-white rounded-xl border border-[#E7E5E4] p-4 flex items-center justify-between group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: idx * 0.05 }}>
              <div className="flex-1">
                <h3 className="font-bold text-[#1C1917]">{quiz.title}</h3>
                <p className="text-sm text-[#78716C]">{quiz.questions?.length || 0} questions • Pass: {quiz.passPercent}%</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog><AlertDialogTrigger asChild><button className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 size={18} /></button></AlertDialogTrigger><AlertDialogContent><AlertDialogTitle>Delete Quiz</AlertDialogTitle><AlertDialogDescription>Delete "{quiz.title}"?</AlertDialogDescription><div className="flex gap-3"><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>Delete</AlertDialogAction></div></AlertDialogContent></AlertDialog>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {quizzes.length === 0 && <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={48} className="mx-auto text-[#E7E5E4] mb-3" /><h3 className="text-xl font-bold text-[#1C1917]">No quizzes yet</h3></motion.div>}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-96 overflow-y-auto"><DialogHeader><DialogTitle>Create Quiz</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <input type="text" placeholder="Quiz Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg" />
            
            <div className="flex gap-4 items-end">
              <div className="flex-1"><label className="text-sm font-medium text-[#1C1917]">Question Type</label><select value={currentQ.type} onChange={(e) => setCurrentQ({...currentQ, type: e.target.value as any})} className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg"><option value="mcq">Multiple Choice</option><option value="fill">Fill Blank</option><option value="truefalse">True/False</option></select></div>
              <input type="text" placeholder="Question text" value={currentQ.text} onChange={(e) => setCurrentQ({...currentQ, text: e.target.value})} className="flex-1 px-4 py-2 border border-[#E7E5E4] rounded-lg" />
              <button onClick={handleAddQuestion} className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg">Add</button>
            </div>

            <div className="border-t pt-4"><h3 className="font-bold mb-2">{formData.questions.length} Questions Added</h3></div>

            <div className="flex gap-2">
              <div className="flex-1"><label className="text-sm">Time Limit (min)</label><input type="number" value={formData.timeLimit} onChange={(e) => setFormData({...formData, timeLimit: Number(e.target.value)})} className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg" min="1" /></div>
              <div className="flex-1"><label className="text-sm">Pass %</label><input type="number" value={formData.passPercent} onChange={(e) => setFormData({...formData, passPercent: Number(e.target.value)})} className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg" min="0" max="100" /></div>
            </div>

            <div className="flex gap-3"><button onClick={() => setIsCreateOpen(false)} className="flex-1 py-2 border border-[#E7E5E4] rounded-lg">Cancel</button><button onClick={handleSaveQuiz} className="flex-1 py-2 bg-[#FF6B35] text-white rounded-lg">Create</button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
