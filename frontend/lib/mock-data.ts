// Mock data for Arambh Training Management System

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
  lessonCount: number
  completionPercent: number
  subcategories?: string[]
}

export interface Lesson {
  id: string
  title: string
  type: 'VIDEO' | 'PDF' | 'AUDIO' | 'NOTE'
  categoryId: string
  duration: number // in minutes
  thumbnail: string
  description: string
  xpReward: number
  isCompleted: boolean
  progress: number // 0-100
  videoUrl?: string
  content?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  avatar: string
  xp: number
  level: number
  streak: number
  score: number
  completedLessons: string[]
  badges: string[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedDate?: string
  color: string
}

export interface Quiz {
  id: string
  title: string
  lessonId: string
  questions: QuizQuestion[]
  timeLimit: number // in seconds
  passPercent: number
}

export interface QuizQuestion {
  id: string
  text: string
  type: 'MCQ' | 'TRUE_FALSE'
  options: string[]
  correctIndex: number
}

export interface Certificate {
  id: string
  userId: string
  courseName: string
  completionDate: string
  score: number
}

export interface Notification {
  id: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  title: string
  description: string
  time: string
  isRead: boolean
  actionUrl?: string
}

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Onboarding',
    icon: '👋',
    color: '#FF6B35',
    description: 'Welcome to Arambh! Get started with the basics',
    lessonCount: 5,
    completionPercent: 100,
  },
  {
    id: 'cat-2',
    name: 'Sales Training',
    icon: '💼',
    color: '#C8A96E',
    description: 'Master our sales process and closing techniques',
    lessonCount: 8,
    completionPercent: 60,
  },
  {
    id: 'cat-3',
    name: 'Product Knowledge',
    icon: '📱',
    color: '#10B981',
    description: 'Deep dive into all our products and features',
    lessonCount: 12,
    completionPercent: 45,
  },
  {
    id: 'cat-4',
    name: 'Customer Support',
    icon: '🎧',
    color: '#FF6B35',
    description: 'Deliver exceptional customer experiences',
    lessonCount: 6,
    completionPercent: 30,
  },
  {
    id: 'cat-5',
    name: 'Compliance',
    icon: '⚖️',
    color: '#3B3B55',
    description: 'Important policies and legal requirements',
    lessonCount: 4,
    completionPercent: 75,
  },
  {
    id: 'cat-6',
    name: 'Leadership Skills',
    icon: '👑',
    color: '#C8A96E',
    description: 'Develop your leadership potential',
    lessonCount: 7,
    completionPercent: 50,
  },
  {
    id: 'cat-7',
    name: 'Technical Basics',
    icon: '⚙️',
    color: '#10B981',
    description: 'Essential tech skills for the modern workplace',
    lessonCount: 9,
    completionPercent: 20,
  },
  {
    id: 'cat-8',
    name: 'Communication',
    icon: '💬',
    color: '#FF6B35',
    description: 'Improve your written and verbal communication',
    lessonCount: 5,
    completionPercent: 80,
  },
]

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Welcome to Arambh',
    type: 'VIDEO',
    categoryId: 'cat-1',
    duration: 5,
    thumbnail: '🎬',
    description: 'Your first step into the Arambh learning platform',
    xpReward: 50,
    isCompleted: true,
    progress: 100,
    videoUrl: 'https://example.com/video1.mp4',
  },
  {
    id: 'lesson-2',
    title: 'Company Culture & Values',
    type: 'VIDEO',
    categoryId: 'cat-1',
    duration: 8,
    thumbnail: '🌟',
    description: 'Learn about our core values and company culture',
    xpReward: 75,
    isCompleted: true,
    progress: 100,
    videoUrl: 'https://example.com/video2.mp4',
  },
  {
    id: 'lesson-3',
    title: 'Sales Fundamentals',
    type: 'VIDEO',
    categoryId: 'cat-2',
    duration: 12,
    thumbnail: '📊',
    description: 'Master the fundamentals of consultative selling',
    xpReward: 100,
    isCompleted: true,
    progress: 100,
    videoUrl: 'https://example.com/video3.mp4',
  },
  {
    id: 'lesson-4',
    title: 'Our Product Suite',
    type: 'PDF',
    categoryId: 'cat-3',
    duration: 15,
    thumbnail: '📄',
    description: 'Complete guide to all Arambh products',
    xpReward: 80,
    isCompleted: false,
    progress: 40,
    content: 'Product documentation...',
  },
  {
    id: 'lesson-5',
    title: 'Customer Service Excellence',
    type: 'AUDIO',
    categoryId: 'cat-4',
    duration: 10,
    thumbnail: '🎵',
    description: 'How to handle customer issues like a pro',
    xpReward: 75,
    isCompleted: false,
    progress: 0,
    content: 'Audio transcript...',
  },
  {
    id: 'lesson-6',
    title: 'Data Privacy Compliance',
    type: 'VIDEO',
    categoryId: 'cat-5',
    duration: 7,
    thumbnail: '🔒',
    description: 'Understanding GDPR and data privacy laws',
    xpReward: 90,
    isCompleted: true,
    progress: 100,
    videoUrl: 'https://example.com/video6.mp4',
  },
  {
    id: 'lesson-7',
    title: 'Team Leadership 101',
    type: 'VIDEO',
    categoryId: 'cat-6',
    duration: 14,
    thumbnail: '👥',
    description: 'Building and managing high-performing teams',
    xpReward: 120,
    isCompleted: false,
    progress: 55,
    videoUrl: 'https://example.com/video7.mp4',
  },
  {
    id: 'lesson-8',
    title: 'Email Communication Best Practices',
    type: 'PDF',
    categoryId: 'cat-8',
    duration: 5,
    thumbnail: '✉️',
    description: 'Write clear, professional, and effective emails',
    xpReward: 50,
    isCompleted: true,
    progress: 100,
    content: 'Email guidelines...',
  },
]

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Ananya Kumar',
    email: 'ananya@arambh.com',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya',
    xp: 2450,
    level: 5,
    streak: 12,
    score: 4.8,
    completedLessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-6', 'lesson-8'],
    badges: ['badge-1', 'badge-2', 'badge-4'],
  },
  {
    id: 'user-2',
    name: 'Rajesh Singh',
    email: 'rajesh@arambh.com',
    role: 'MANAGER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
    xp: 5200,
    level: 8,
    streak: 28,
    score: 4.9,
    completedLessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-6', 'lesson-7', 'lesson-8'],
    badges: ['badge-1', 'badge-2', 'badge-3', 'badge-4', 'badge-5'],
  },
  {
    id: 'user-3',
    name: 'Priya Patel',
    email: 'priya@arambh.com',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    xp: 8900,
    level: 12,
    streak: 45,
    score: 5.0,
    completedLessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5', 'lesson-6', 'lesson-7', 'lesson-8'],
    badges: ['badge-1', 'badge-2', 'badge-3', 'badge-4', 'badge-5'],
  },
  {
    id: 'user-4',
    name: 'Vikram Desai',
    email: 'vikram@arambh.com',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    xp: 1850,
    level: 3,
    streak: 5,
    score: 4.5,
    completedLessons: ['lesson-1', 'lesson-2'],
    badges: ['badge-1'],
  },
  {
    id: 'user-5',
    name: 'Divya Sharma',
    email: 'divya@arambh.com',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=divya',
    xp: 3200,
    level: 6,
    streak: 18,
    score: 4.7,
    completedLessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-6', 'lesson-7', 'lesson-8'],
    badges: ['badge-1', 'badge-2', 'badge-3'],
  },
  {
    id: 'user-6',
    name: 'Amit Joshi',
    email: 'amit@arambh.com',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
    xp: 2100,
    level: 4,
    streak: 8,
    score: 4.3,
    completedLessons: ['lesson-1', 'lesson-2', 'lesson-3'],
    badges: ['badge-1', 'badge-2'],
  },
  {
    id: 'user-7',
    name: 'Neha Verma',
    email: 'neha@arambh.com',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha',
    xp: 4100,
    level: 7,
    streak: 22,
    score: 4.6,
    completedLessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-6', 'lesson-7'],
    badges: ['badge-1', 'badge-2', 'badge-3', 'badge-4'],
  },
  {
    id: 'user-8',
    name: 'Sanjay Kumar',
    email: 'sanjay@arambh.com',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sanjay',
    xp: 1500,
    level: 3,
    streak: 3,
    score: 4.2,
    completedLessons: ['lesson-1', 'lesson-2'],
    badges: ['badge-1'],
  },
  {
    id: 'user-9',
    name: 'Pooja Singh',
    email: 'pooja@arambh.com',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pooja',
    xp: 3600,
    level: 6,
    streak: 15,
    score: 4.8,
    completedLessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-6', 'lesson-8'],
    badges: ['badge-1', 'badge-2', 'badge-3'],
  },
  {
    id: 'user-10',
    name: 'Harsh Malhotra',
    email: 'harsh@arambh.com',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harsh',
    xp: 2800,
    level: 5,
    streak: 10,
    score: 4.4,
    completedLessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-7'],
    badges: ['badge-1', 'badge-2'],
  },
]

export const MOCK_BADGES: Badge[] = [
  {
    id: 'badge-1',
    name: 'First Steps',
    description: 'Completed your first lesson',
    icon: '👣',
    color: '#FF6B35',
  },
  {
    id: 'badge-2',
    name: 'Knowledge Seeker',
    description: 'Completed 5 lessons',
    icon: '🔍',
    color: '#C8A96E',
  },
  {
    id: 'badge-3',
    name: 'Quiz Master',
    description: 'Scored 100% on a quiz',
    icon: '🎯',
    color: '#10B981',
  },
  {
    id: 'badge-4',
    name: 'Week Warrior',
    description: 'Maintained 7-day streak',
    icon: '⚔️',
    color: '#FF6B35',
  },
  {
    id: 'badge-5',
    name: 'Level 10 Hero',
    description: 'Reached level 10',
    icon: '🏆',
    color: '#C8A96E',
  },
]

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Onboarding Basics',
    lessonId: 'lesson-1',
    timeLimit: 300,
    passPercent: 70,
    questions: [
      {
        id: 'q-1',
        text: 'What is Arambh?',
        type: 'MCQ',
        options: ['A training platform', 'A shopping app', 'A social network', 'A payment service'],
        correctIndex: 0,
      },
      {
        id: 'q-2',
        text: 'Arambh helps companies train employees faster.',
        type: 'TRUE_FALSE',
        options: ['True', 'False'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'quiz-2',
    title: 'Sales Fundamentals',
    lessonId: 'lesson-3',
    timeLimit: 600,
    passPercent: 75,
    questions: [
      {
        id: 'q-3',
        text: 'What is consultative selling?',
        type: 'MCQ',
        options: ['Selling without consultation', 'Understanding customer needs first', 'Aggressive selling', 'None of the above'],
        correctIndex: 1,
      },
    ],
  },
]

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    userId: 'user-1',
    courseName: 'Onboarding Mastery',
    completionDate: '2024-03-05',
    score: 95,
  },
  {
    id: 'cert-2',
    userId: 'user-2',
    courseName: 'Sales Excellence',
    completionDate: '2024-02-28',
    score: 98,
  },
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'SUCCESS',
    title: 'Lesson Completed!',
    description: 'You completed "Welcome to Arambh" and earned 50 XP',
    time: '2 hours ago',
    isRead: false,
    actionUrl: '/learn/content/lesson-1',
  },
  {
    id: 'notif-2',
    type: 'INFO',
    title: 'New Content Available',
    description: 'Leadership Skills has 3 new lessons',
    time: '5 hours ago',
    isRead: false,
    actionUrl: '/learn/categories/cat-6',
  },
  {
    id: 'notif-3',
    type: 'SUCCESS',
    title: 'Badge Earned!',
    description: 'You earned the "Knowledge Seeker" badge',
    time: '1 day ago',
    isRead: true,
  },
]

export const MOCK_AI_RESPONSES = {
  sales: 'Our sales training covers consultative selling, closing techniques, and customer relationship management. Start with the Sales Fundamentals video to learn our proven 5-step sales process.',
  products: 'Learn about our complete product suite including Arambh Academy, Analytics Dashboard, and Integration Hub. Check out the "Our Product Suite" PDF for a detailed comparison.',
  compliance: 'Compliance training is mandatory for all employees. Make sure to complete our GDPR and Data Privacy modules to stay updated on legal requirements.',
  default: 'I found some relevant training materials for you. Browse our course catalog or search for specific topics.',
}
