"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  Zap,
  RotateCcw,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import Confetti from "react-confetti"

// Mock quiz data
const quizData = {
  id: 1,
  title: "Shop Floor Safety Rules Quiz",
  category: "Safety Training",
  totalQuestions: 5,
  timeLimit: 300, // 5 minutes in seconds
  passingScore: 60,
  xpReward: 100,
  questions: [
    {
      id: 1,
      type: "mcq",
      question: "What is the first thing you should do when entering the shop floor?",
      options: [
        "Start working immediately",
        "Put on your safety gear",
        "Chat with colleagues",
        "Check your phone",
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      type: "mcq",
      question: "Which color helmet indicates a supervisor on the shop floor?",
      options: ["Yellow", "White", "Red", "Blue"],
      correctAnswer: 1,
    },
    {
      id: 3,
      type: "truefalse",
      question: "It is safe to operate machinery without proper training.",
      correctAnswer: false,
    },
    {
      id: 4,
      type: "mcq",
      question: "What should you do if you notice a safety hazard?",
      options: [
        "Ignore it",
        "Report it to your supervisor immediately",
        "Fix it yourself without telling anyone",
        "Wait until break time to mention it",
      ],
      correctAnswer: 1,
    },
    {
      id: 5,
      type: "mcq",
      question: "How often should fire extinguishers be inspected?",
      options: ["Once a year", "Once a month", "Once a week", "Never"],
      correctAnswer: 1,
    },
  ],
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | boolean | null)[]>(
    new Array(quizData.questions.length).fill(null)
  )
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit)
  const [showConfetti, setShowConfetti] = useState(false)

  const question = quizData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizData.totalQuestions) * 100

  // Timer
  useEffect(() => {
    if (quizCompleted || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setQuizCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizCompleted, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSelectAnswer = (answer: number | boolean) => {
    if (showFeedback) return

    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answer
    setSelectedAnswers(newAnswers)

    // Show feedback
    const correct =
      question.type === "truefalse"
        ? answer === question.correctAnswer
        : answer === question.correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)

    // Auto advance after delay
    setTimeout(() => {
      if (currentQuestion < quizData.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setShowFeedback(false)
      } else {
        setQuizCompleted(true)
      }
    }, 1500)
  }

  // Calculate results
  const calculateResults = useCallback(() => {
    let correct = 0
    quizData.questions.forEach((q, i) => {
      if (q.type === "truefalse") {
        if (selectedAnswers[i] === q.correctAnswer) correct++
      } else {
        if (selectedAnswers[i] === q.correctAnswer) correct++
      }
    })
    return {
      correct,
      total: quizData.questions.length,
      percentage: Math.round((correct / quizData.questions.length) * 100),
      passed: Math.round((correct / quizData.questions.length) * 100) >= quizData.passingScore,
    }
  }, [selectedAnswers])

  const results = quizCompleted ? calculateResults() : null

  useEffect(() => {
    if (results?.passed) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [results?.passed])

  const timerColor =
    timeRemaining <= 10
      ? "text-red-500"
      : timeRemaining <= 30
      ? "text-[#FF6B35]"
      : "text-[#1C1917]"

  // Quiz Completed Screen
  if (quizCompleted && results) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
              results.passed ? "bg-[#10B981]/10" : "bg-red-100"
            }`}
          >
            {results.passed ? (
              <Trophy size={56} className="text-[#10B981]" />
            ) : (
              <AlertCircle size={56} className="text-red-500" />
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-2xl font-bold mb-2 ${
              results.passed ? "text-[#10B981]" : "text-red-500"
            }`}
          >
            {results.passed ? "Congratulations!" : "Keep Trying!"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[#78716C] mb-8"
          >
            {results.passed
              ? "You passed the quiz successfully!"
              : "You need 60% to pass. Try again!"}
          </motion.p>

          {/* Score Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative w-40 h-40 mb-8"
          >
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#E7E5E4"
                strokeWidth="12"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={results.passed ? "#10B981" : "#FF6B35"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={440}
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * results.percentage) / 100 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-[#1C1917]">
                {results.percentage}%
              </span>
              <span className="text-sm text-[#78716C]">Score</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-6 mb-8"
          >
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center text-[#10B981]">
                <CheckCircle2 size={18} />
                <span className="font-bold">{results.correct}</span>
              </div>
              <p className="text-xs text-[#78716C]">Correct</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center text-red-500">
                <XCircle size={18} />
                <span className="font-bold">{results.total - results.correct}</span>
              </div>
              <p className="text-xs text-[#78716C]">Wrong</p>
            </div>
            {results.passed && (
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center text-[#FF6B35]">
                  <Zap size={18} />
                  <span className="font-bold">+{quizData.xpReward}</span>
                </div>
                <p className="text-xs text-[#78716C]">XP Earned</p>
              </div>
            )}
          </motion.div>

          {/* Question Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-2 mb-8"
          >
            {quizData.questions.map((q, i) => {
              const answered = selectedAnswers[i]
              const isCorrectAnswer =
                q.type === "truefalse"
                  ? answered === q.correctAnswer
                  : answered === q.correctAnswer
              return (
                <div
                  key={q.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCorrectAnswer
                      ? "bg-[#10B981] text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {i + 1}
                </div>
              )
            })}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-3 w-full max-w-xs"
          >
            <Link
              href="/learn"
              className="flex-1 py-3 px-4 rounded-xl bg-[#1C1917] text-white text-center text-sm font-medium"
            >
              Continue Learning
            </Link>
            {!results.passed && (
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E7E5E4] text-[#1C1917] text-sm font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Retake
              </button>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-[#FAF9F7] border-b border-[#E7E5E4] px-4 py-3"
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link href="/learn" className="text-[#78716C]">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-center">
            <p className="text-xs text-[#78716C]">Question</p>
            <p className="font-semibold text-[#1C1917]">
              {currentQuestion + 1} of {quizData.totalQuestions}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 ${timerColor}`}>
            <Clock size={16} className={timeRemaining <= 10 ? "animate-pulse" : ""} />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </motion.header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[#E7E5E4]">
        <motion.div
          className="h-full bg-[#FF6B35]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Content */}
      <div className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            {/* Question */}
            <motion.h2
              className="text-lg md:text-xl font-semibold text-[#1C1917] text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {question.question}
            </motion.h2>

            {/* Options */}
            <div className="flex-1 flex flex-col justify-center space-y-3">
              {question.type === "truefalse" ? (
                // True/False Options
                <div className="flex gap-3">
                  {[true, false].map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestion] === option
                    const isCorrectOption = question.correctAnswer === option
                    const showCorrectFeedback = showFeedback && isCorrectOption
                    const showWrongFeedback = showFeedback && isSelected && !isCorrectOption

                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleSelectAnswer(option)}
                        disabled={showFeedback}
                        className={`flex-1 py-6 rounded-2xl text-lg font-semibold transition-all border-2 ${
                          showCorrectFeedback
                            ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]"
                            : showWrongFeedback
                            ? "border-red-500 bg-red-50 text-red-500"
                            : isSelected
                            ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                            : "border-[#E7E5E4] bg-white text-[#1C1917] hover:border-[#FF6B35]"
                        }`}
                        whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                        whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {option ? "True" : "False"}
                        {showCorrectFeedback && (
                          <CheckCircle2 className="inline ml-2" size={20} />
                        )}
                        {showWrongFeedback && <XCircle className="inline ml-2" size={20} />}
                      </motion.button>
                    )
                  })}
                </div>
              ) : (
                // MCQ Options
                question.options?.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestion] === idx
                  const isCorrectOption = question.correctAnswer === idx
                  const showCorrectFeedback = showFeedback && isCorrectOption
                  const showWrongFeedback = showFeedback && isSelected && !isCorrectOption

                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      disabled={showFeedback}
                      className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all border-2 flex items-center gap-3 ${
                        showCorrectFeedback
                          ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]"
                          : showWrongFeedback
                          ? "border-red-500 bg-red-50 text-red-500"
                          : isSelected
                          ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                          : "border-[#E7E5E4] bg-white text-[#1C1917] hover:border-[#FF6B35]"
                      }`}
                      whileHover={{ scale: showFeedback ? 1 : 1.01, x: showFeedback ? 0 : 4 }}
                      whileTap={{ scale: showFeedback ? 1 : 0.99 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          showCorrectFeedback
                            ? "bg-[#10B981] text-white"
                            : showWrongFeedback
                            ? "bg-red-500 text-white"
                            : isSelected
                            ? "bg-[#FF6B35] text-white"
                            : "bg-[#E7E5E4] text-[#78716C]"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {showCorrectFeedback && <CheckCircle2 size={20} />}
                      {showWrongFeedback && <XCircle size={20} />}
                    </motion.button>
                  )
                })
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
