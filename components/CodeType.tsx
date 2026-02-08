'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Zap, Target, Trophy, RotateCcw, ChevronDown } from 'lucide-react'

const CODE_SNIPPETS = {
    javascript: [
        `const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};`,
        `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`,
        `const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};`
    ],
    python: [
        `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    
    def inorder(self, root):
        return self.inorder(root.left) + [root.val] + self.inorder(root.right) if root else []`,
        `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`
    ],
    java: [
        `public class BinaryTree {
    class Node {
        int data;
        Node left, right;
        Node(int item) {
            data = item;
            left = right = null;
        }
    }
    Node root;
}`,
        `public int factorial(int n) {
    if (n == 0 || n == 1) {
        return 1;
    }
    return n * factorial(n - 1);
}`,
        `public void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`
    ],
    cpp: [
        `template <typename T>
class Stack {
private:
    vector<T> elements;
public:
    void push(T const& elem) {
        elements.push_back(elem);
    }
    T pop() {
        T elem = elements.back();
        elements.pop_back();
        return elem;
    }
};`,
        `int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        `void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
    ],
    typescript: [
        `interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): Promise<User> {
  return fetch('/api/onboarding/profile')
    .then(res => res.json())
    .then((data: { profile?: { id?: number; display_name?: string } }) =>
      data.profile ? { id: data.profile.id ?? id, name: data.profile.display_name ?? '', email: '' } : { id, name: '', email: '' }
    );
}`,
        `type Status = 'pending' | 'active' | 'completed';

class Task<T> {
  private status: Status = 'pending';
  constructor(public data: T) {}
  
  complete(): void {
    this.status = 'completed';
  }
}`,
        `function genericMap<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

const result = genericMap([1, 2, 3], x => x.toString());`
    ],
    rust: [
        `fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}`,
        `struct Point {
    x: i32,
    y: i32,
}

impl Point {
    fn new(x: i32, y: i32) -> Self {
        Point { x, y }
    }
    
    fn distance(&self, other: &Point) -> f64 {
        let dx = (self.x - other.x) as f64;
        let dy = (self.y - other.y) as f64;
        (dx * dx + dy * dy).sqrt()
    }
}`,
        `fn binary_search(arr: &[i32], target: i32) -> Option<usize> {
    let mut left = 0;
    let mut right = arr.len();
    
    while left < right {
        let mid = (left + right) / 2;
        match arr[mid].cmp(&target) {
            std::cmp::Ordering::Equal => return Some(mid),
            std::cmp::Ordering::Less => left = mid + 1,
            std::cmp::Ordering::Greater => right = mid,
        }
    }
    None
}`
    ],
    go: [
        `func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}`,
        `type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func inorderTraversal(root *TreeNode) []int {
    if root == nil {
        return []int{}
    }
    result := inorderTraversal(root.Left)
    result = append(result, root.Val)
    result = append(result, inorderTraversal(root.Right)...)
    return result
}`,
        `func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := (left + right) / 2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}`
    ]
}

type Language = keyof typeof CODE_SNIPPETS

export default function CodeType() {
    const [language, setLanguage] = useState<Language>('javascript')
    const [codeSnippet, setCodeSnippet] = useState('')
    const [userInput, setUserInput] = useState('')
    const [startTime, setStartTime] = useState<number | null>(null)
    const [endTime, setEndTime] = useState<number | null>(null)
    const [isComplete, setIsComplete] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [errors, setErrors] = useState(0)
    const [showLanguageMenu, setShowLanguageMenu] = useState(false)
    const [liveNow, setLiveNow] = useState(Date.now())
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        resetGame()
    }, [language])

    // Update live time every second so current WPM ticks while typing
    useEffect(() => {
        if (!startTime || isComplete) return
        const interval = setInterval(() => setLiveNow(Date.now()), 1000)
        return () => clearInterval(interval)
    }, [startTime, isComplete])

    const resetGame = () => {
        const snippets = CODE_SNIPPETS[language]
        const randomSnippet = snippets[Math.floor(Math.random() * snippets.length)]
        setCodeSnippet(randomSnippet)
        setUserInput('')
        setStartTime(null)
        setEndTime(null)
        setIsComplete(false)
        setCurrentIndex(0)
        setErrors(0)
        inputRef.current?.focus()
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value

        if (!startTime) {
            setStartTime(Date.now())
        }

        // Check for errors
        if (value.length > userInput.length) {
            const newChar = value[value.length - 1]
            const expectedChar = codeSnippet[value.length - 1]
            if (newChar !== expectedChar) {
                setErrors(errors + 1)
            }
        }

        setUserInput(value)
        setCurrentIndex(value.length)

        // Check if complete
        if (value === codeSnippet) {
            setEndTime(Date.now())
            setIsComplete(true)
        }
    }

    const calculateWPM = () => {
        if (!startTime || !endTime) return 0
        const timeInMinutes = (endTime - startTime) / 60000
        const words = codeSnippet.split(' ').length
        return Math.round(words / timeInMinutes)
    }

    // Current/live WPM while typing (standard: 5 chars = 1 word)
    const getCurrentWPM = () => {
        if (!startTime || userInput.length === 0) return null
        const end = isComplete && endTime ? endTime : liveNow
        const timeInMinutes = (end - startTime) / 60000
        if (timeInMinutes <= 0) return 0
        const words = userInput.length / 5
        return Math.round(words / timeInMinutes)
    }

    const calculateAccuracy = () => {
        if (userInput.length === 0) return 100
        const correctChars = codeSnippet.length - errors
        return Math.round((correctChars / codeSnippet.length) * 100)
    }

    const getCharacterClass = (index: number) => {
        if (index < currentIndex) {
            return userInput[index] === codeSnippet[index] ? 'text-green-400' : 'text-red-400 bg-red-400/20'
        }
        if (index === currentIndex) {
            return 'bg-primary/30 border-l-2 border-primary animate-pulse'
        }
        return 'text-slate-500'
    }

    return (
        <div className="glass-card p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Code2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">CodeType</h2>
                        <p className="text-sm text-slate-400">Test your coding speed & accuracy</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Language Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-primary transition-colors flex items-center gap-2"
                        >
                            <span className="capitalize">{language}</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                            {showLanguageMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden"
                                >
                                    {Object.keys(CODE_SNIPPETS).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => {
                                                setLanguage(lang as Language)
                                                setShowLanguageMenu(false)
                                            }}
                                            className={`w-full px-4 py-2 text-left hover:bg-primary/20 transition-colors capitalize ${lang === language ? 'bg-primary/10 text-primary' : ''
                                                }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={resetGame}
                        className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-primary transition-colors"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-slate-400">WPM</span>
                    </div>
                    <div className="text-2xl font-bold">{isComplete ? calculateWPM() : (getCurrentWPM() ?? '--')}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-slate-400">Accuracy</span>
                    </div>
                    <div className="text-2xl font-bold">{calculateAccuracy()}%</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-slate-400">Errors</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400">{errors}</div>
                </div>
            </div>

            {/* Code Display */}
            <div className="relative mb-4">
                <div className="bg-slate-900 rounded-lg p-6 font-mono text-sm leading-relaxed border border-slate-700 min-h-[200px] overflow-auto">
                    <pre className="whitespace-pre-wrap">
                        {codeSnippet.split('').map((char, index) => (
                            <span key={index} className={getCharacterClass(index)}>
                                {char}
                            </span>
                        ))}
                    </pre>
                </div>
            </div>

            {/* Input Area */}
            <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                disabled={isComplete}
                className="w-full h-48 bg-slate-900 rounded-lg p-6 font-mono text-sm border-2 border-slate-700 focus:border-primary outline-none transition-colors resize-none"
                placeholder="Start typing to begin..."
            />

            {/* Completion Message */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="mt-6 p-6 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-green-400 mb-2">🎉 Excellent Work!</h3>
                                <p className="text-slate-300">
                                    You typed at <span className="font-bold text-primary">{calculateWPM()} WPM</span> with{' '}
                                    <span className="font-bold text-green-400">{calculateAccuracy()}% accuracy</span>
                                </p>
                            </div>
                            <button
                                onClick={resetGame}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
