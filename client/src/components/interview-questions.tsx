import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HiringInsights, LanguageBreakdown } from "@shared/schema";
import { MessageSquare, RefreshCw, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface InterviewQuestionsProps {
  insights: HiringInsights;
  languages: LanguageBreakdown;
  candidateName: string;
}

type Difficulty = "Easy" | "Medium" | "Hard";
type Category = "Technical" | "Behavioral" | "System Design" | "Code Review" | "Problem Solving";

interface Question {
  question: string;
  category: Category;
  difficulty: Difficulty;
  context: string;
}

const LANGUAGE_QUESTIONS: Record<string, Question[]> = {
  JavaScript: [
    { question: "Explain the difference between var, let, and const. When would you use each?", category: "Technical", difficulty: "Easy", context: "JavaScript fundamentals" },
    { question: "How does the event loop work in JavaScript? Walk me through a practical example.", category: "Technical", difficulty: "Medium", context: "JavaScript runtime" },
    { question: "What are closures, and can you give a real-world use case from your projects?", category: "Technical", difficulty: "Medium", context: "JavaScript concepts" },
    { question: "Explain prototypal inheritance vs class-based inheritance in JavaScript.", category: "Technical", difficulty: "Medium", context: "JavaScript OOP" },
    { question: "How would you optimize the performance of a JavaScript-heavy web application?", category: "Problem Solving", difficulty: "Hard", context: "Performance" },
  ],
  TypeScript: [
    { question: "What advantages does TypeScript bring to a project? What are the tradeoffs?", category: "Technical", difficulty: "Easy", context: "TypeScript basics" },
    { question: "Explain the difference between interfaces and types. When do you prefer one over the other?", category: "Technical", difficulty: "Medium", context: "TypeScript type system" },
    { question: "How do you handle complex generic types? Can you give an example from your work?", category: "Technical", difficulty: "Hard", context: "TypeScript generics" },
    { question: "What are discriminated unions and how have you used them?", category: "Technical", difficulty: "Medium", context: "TypeScript patterns" },
  ],
  Python: [
    { question: "Explain the difference between a list and a tuple. When would you use each?", category: "Technical", difficulty: "Easy", context: "Python basics" },
    { question: "How do decorators work in Python? Write one that logs function execution time.", category: "Technical", difficulty: "Medium", context: "Python decorators" },
    { question: "What is the GIL and how does it affect multithreaded Python programs?", category: "Technical", difficulty: "Hard", context: "Python internals" },
    { question: "Explain generators and when they are more appropriate than list comprehensions.", category: "Technical", difficulty: "Medium", context: "Python iteration" },
  ],
  Java: [
    { question: "Explain the difference between abstract classes and interfaces in Java.", category: "Technical", difficulty: "Easy", context: "Java OOP" },
    { question: "How does garbage collection work in Java? What are the different GC algorithms?", category: "Technical", difficulty: "Hard", context: "Java memory" },
    { question: "What is the Stream API and how does it compare to traditional loops?", category: "Technical", difficulty: "Medium", context: "Java streams" },
  ],
  Go: [
    { question: "How do goroutines differ from threads? What are channels used for?", category: "Technical", difficulty: "Medium", context: "Go concurrency" },
    { question: "Explain Go's approach to error handling. What are your thoughts on it?", category: "Technical", difficulty: "Easy", context: "Go patterns" },
    { question: "How would you design a concurrent pipeline in Go for data processing?", category: "System Design", difficulty: "Hard", context: "Go architecture" },
  ],
  Rust: [
    { question: "Explain ownership and borrowing in Rust. Why do they matter?", category: "Technical", difficulty: "Medium", context: "Rust memory safety" },
    { question: "What is the difference between String and &str? When do you use each?", category: "Technical", difficulty: "Easy", context: "Rust strings" },
    { question: "How do lifetimes work and when do you need to annotate them explicitly?", category: "Technical", difficulty: "Hard", context: "Rust lifetimes" },
  ],
  "C++": [
    { question: "Explain RAII and how it relates to resource management in C++.", category: "Technical", difficulty: "Medium", context: "C++ memory" },
    { question: "What are smart pointers? When would you use shared_ptr vs unique_ptr?", category: "Technical", difficulty: "Medium", context: "C++ modern features" },
  ],
  Ruby: [
    { question: "Explain blocks, procs, and lambdas in Ruby. How do they differ?", category: "Technical", difficulty: "Medium", context: "Ruby concepts" },
    { question: "How does metaprogramming work in Ruby? Give a practical example.", category: "Technical", difficulty: "Hard", context: "Ruby metaprogramming" },
  ],
  Swift: [
    { question: "Explain optionals in Swift and the different ways to unwrap them.", category: "Technical", difficulty: "Easy", context: "Swift safety" },
    { question: "What are protocols in Swift and how do protocol extensions enable protocol-oriented programming?", category: "Technical", difficulty: "Medium", context: "Swift patterns" },
  ],
  PHP: [
    { question: "How do you handle dependency injection in PHP applications?", category: "Technical", difficulty: "Medium", context: "PHP architecture" },
    { question: "Explain the difference between abstract classes and interfaces in PHP.", category: "Technical", difficulty: "Easy", context: "PHP OOP" },
  ],
  Kotlin: [
    { question: "How do coroutines work in Kotlin? How do they compare to threads?", category: "Technical", difficulty: "Medium", context: "Kotlin concurrency" },
    { question: "Explain null safety in Kotlin and how it prevents NullPointerExceptions.", category: "Technical", difficulty: "Easy", context: "Kotlin safety" },
  ],
};

const EXPERIENCE_QUESTIONS: Record<HiringInsights["experienceLevel"], Question[]> = {
  "Senior": [
    { question: "Describe a system you architected from scratch. What tradeoffs did you make?", category: "System Design", difficulty: "Hard", context: "Architecture experience" },
    { question: "How do you approach mentoring junior developers? Give a specific example.", category: "Behavioral", difficulty: "Medium", context: "Leadership" },
    { question: "Tell me about a time you had to make a difficult technical decision under pressure.", category: "Behavioral", difficulty: "Medium", context: "Decision making" },
    { question: "How do you evaluate whether to build something custom vs using an existing library?", category: "Problem Solving", difficulty: "Hard", context: "Technical judgment" },
    { question: "Design a scalable notification system that handles millions of users.", category: "System Design", difficulty: "Hard", context: "System design" },
  ],
  "Mid-Level": [
    { question: "Walk me through how you'd debug a performance issue in production.", category: "Problem Solving", difficulty: "Medium", context: "Debugging skills" },
    { question: "How do you approach writing tests? What's your strategy for test coverage?", category: "Technical", difficulty: "Medium", context: "Testing practices" },
    { question: "Describe a time when you had to refactor a significant piece of code. What was your approach?", category: "Behavioral", difficulty: "Medium", context: "Code quality" },
    { question: "How do you handle disagreements about technical approaches with teammates?", category: "Behavioral", difficulty: "Easy", context: "Collaboration" },
  ],
  "Junior": [
    { question: "Tell me about a project you're most proud of. What challenges did you overcome?", category: "Behavioral", difficulty: "Easy", context: "Project experience" },
    { question: "How do you approach learning a new technology or framework?", category: "Behavioral", difficulty: "Easy", context: "Growth mindset" },
    { question: "What's the difference between a stack and a queue? When would you use each?", category: "Technical", difficulty: "Easy", context: "Data structures" },
    { question: "Explain what an API is and how you've used one in a project.", category: "Technical", difficulty: "Easy", context: "Web fundamentals" },
  ],
  "Entry-Level": [
    { question: "Why did you choose to pursue software development?", category: "Behavioral", difficulty: "Easy", context: "Motivation" },
    { question: "Tell me about a personal project. What did you learn from building it?", category: "Behavioral", difficulty: "Easy", context: "Self-learning" },
    { question: "What is version control and why is it important?", category: "Technical", difficulty: "Easy", context: "Git basics" },
    { question: "Explain the difference between frontend and backend development.", category: "Technical", difficulty: "Easy", context: "Web basics" },
  ],
};

const GENERAL_QUESTIONS: Question[] = [
  { question: "If you could redesign one of your GitHub projects from scratch, which would it be and why?", category: "Code Review", difficulty: "Medium", context: "Self-reflection" },
  { question: "How do you decide when code is 'good enough' to ship?", category: "Problem Solving", difficulty: "Medium", context: "Pragmatism" },
  { question: "Walk me through your typical workflow when starting a new feature.", category: "Behavioral", difficulty: "Easy", context: "Process" },
  { question: "How do you stay current with new technologies and best practices?", category: "Behavioral", difficulty: "Easy", context: "Continuous learning" },
  { question: "Describe a bug that took you a long time to find. How did you eventually solve it?", category: "Problem Solving", difficulty: "Medium", context: "Debugging" },
];

const PROJECT_QUESTIONS: Question[] = [
  { question: "I see you have several repositories. How do you decide which projects to prioritize?", category: "Behavioral", difficulty: "Easy", context: "Candidate's repos" },
  { question: "Looking at your top project, walk me through the architecture decisions you made.", category: "Code Review", difficulty: "Medium", context: "Candidate's top project" },
  { question: "What would you improve about your most-starred repository if you had more time?", category: "Code Review", difficulty: "Medium", context: "Code quality awareness" },
];

const CATEGORY_COLORS: Record<Category, string> = {
  "Technical": "bg-primary/10 text-primary",
  "Behavioral": "bg-muted text-muted-foreground",
  "System Design": "bg-primary/15 text-primary",
  "Code Review": "bg-muted text-muted-foreground",
  "Problem Solving": "bg-primary/10 text-primary",
};

function shuffleArray<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor((Math.sin(seed + i) * 0.5 + 0.5) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function InterviewQuestions({ insights, languages, candidateName }: InterviewQuestionsProps) {
  const [expanded, setExpanded] = useState(false);
  const [seed, setSeed] = useState(Date.now());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const questions = useMemo(() => {
    const pool: Question[] = [];

    const langEntries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
    for (const [lang] of langEntries.slice(0, 3)) {
      const langQs = LANGUAGE_QUESTIONS[lang];
      if (langQs) {
        pool.push(...langQs);
      }
    }

    pool.push(...(EXPERIENCE_QUESTIONS[insights.experienceLevel] || []));
    pool.push(...GENERAL_QUESTIONS);

    if (insights.topProjects.length > 0) {
      pool.push(...PROJECT_QUESTIONS);
    }

    const shuffled = shuffleArray(pool, seed);

    const seen = new Set<string>();
    const unique: Question[] = [];
    for (const q of shuffled) {
      if (!seen.has(q.question)) {
        seen.add(q.question);
        unique.push(q);
      }
    }

    return unique.slice(0, 12);
  }, [insights, languages, seed]);

  const displayedQuestions = expanded ? questions : questions.slice(0, 5);

  const handleCopy = async (question: string, index: number) => {
    try {
      await navigator.clipboard.writeText(question);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {}
  };

  const handleRegenerate = () => {
    setSeed(Date.now());
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            Interview Questions
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-normal" data-testid="badge-experience-level">
              {insights.experienceLevel}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              className="h-7 w-7 p-0"
              data-testid="button-regenerate-questions"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Tailored for {candidateName} based on their {insights.primarySkills.slice(0, 3).join(", ")} experience
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayedQuestions.map((q, i) => (
          <div
            key={`${seed}-${i}`}
            className="group flex items-start gap-3 p-3 rounded-md border bg-card hover:bg-muted/30 transition-colors"
            data-testid={`card-question-${i}`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-xs leading-relaxed" data-testid={`text-question-${i}`}>{q.question}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[q.category]}`}>
                  {q.category}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {q.difficulty}
                </span>
                <span className="text-[9px] text-muted-foreground/50">
                  — {q.context}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleCopy(q.question, i)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted shrink-0"
              data-testid={`button-copy-question-${i}`}
            >
              {copiedIndex === i ? (
                <Check className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        ))}

        {questions.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-xs gap-1.5 mt-1"
            data-testid="button-toggle-questions"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Show {questions.length - 5} More Questions
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
