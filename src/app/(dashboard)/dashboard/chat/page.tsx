"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: Date;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Transfers from La Liga",
    updatedAt: new Date(),
    messages: [
      {
        id: "m1",
        role: "assistant",
        content:
          "I can help you with player analysis, transfer recommendations, and tactical insights. What would you like to know?",
        timestamp: new Date(),
      },
      {
        id: "m2",
        role: "user",
        content: "Show me the best central midfielders under 23 years old",
        timestamp: new Date(),
      },
      {
        id: "m3",
        role: "assistant",
        content:
          "Here are a few starting points:\n\n- **Alejandro Ruiz** — elite progressive passing\n- **Marco Dantas** — strong defensive recoveries\n- **Jules Martin** — high duel win rate\n\nYou can ask for a deeper profile on any of them.",
        timestamp: new Date(),
      },
    ],
  },
  {
    id: "conv-2",
    title: "Best strikers under 25",
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    messages: [],
  },
  {
    id: "conv-3",
    title: "Loan targets in Championship",
    updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    messages: [],
  },
  {
    id: "conv-4",
    title: "Top CBs in Europe",
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    messages: [],
  },
  {
    id: "conv-5",
    title: "Winger shortlist",
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    messages: [],
  },
];

function formatMessageCount(count: number): string {
  if (count === 1) return "1 message";
  return `${count} messages`;
}

function categorizeConversation(date: Date): "Today" | "Yesterday" | "Last 7 Days" | "Older" {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfLastWeek = new Date(startOfToday);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= startOfLastWeek) return "Last 7 Days";
  return "Older";
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12h18" />
      <path d="M3 6h18" />
      <path d="M3 18h18" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="14" rx="4" />
      <path d="M12 7V3" />
      <circle cx="8" cy="13" r="1.5" />
      <circle cx="16" cy="13" r="1.5" />
      <path d="M8 17h8" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" />
      <path d="M5 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function renderInline(text: string, role: ChatMessage["role"], keyPrefix: string) {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^\)]+\))/;
  const nodes: ReactNode[] = [];
  let remaining = text;
  let index = 0;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);
    if (!match || match.index === undefined) {
      nodes.push(remaining);
      break;
    }

    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    const token = match[0];
    if (token.startsWith("`")) {
      const content = token.slice(1, -1);
      nodes.push(
        <code
          key={`${keyPrefix}-code-${index}`}
          className={`px-1.5 py-0.5 rounded text-[14px] font-mono ${
            role === "assistant"
              ? "bg-gray-200 text-gray-900"
              : "bg-blue-700 text-white"
          }`}
        >
          {content}
        </code>
      );
    } else if (token.startsWith("**")) {
      const content = token.slice(2, -2);
      nodes.push(
        <strong key={`${keyPrefix}-bold-${index}`} className="font-semibold">
          {content}
        </strong>
      );
    } else if (token.startsWith("*")) {
      const content = token.slice(1, -1);
      nodes.push(
        <em key={`${keyPrefix}-italic-${index}`} className="italic">
          {content}
        </em>
      );
    } else if (token.startsWith("[")) {
      const labelMatch = token.match(/\[([^\]]+)\]\(([^\)]+)\)/);
      if (labelMatch) {
        nodes.push(
          <a
            key={`${keyPrefix}-link-${index}`}
            href={labelMatch[2]}
            className={
              role === "assistant"
                ? "text-blue-600 hover:text-blue-700 underline"
                : "text-blue-100 hover:text-white underline"
            }
          >
            {labelMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(token);
    }

    remaining = remaining.slice(match.index + token.length);
    index += 1;
  }

  return nodes;
}

function renderMarkdown(content: string, role: ChatMessage["role"], keyPrefix: string) {
  const blocks: ReactNode[] = [];
  const lines = content.split("\n");
  let buffer: string[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length === 0) return;
    const text = normalizeText(buffer.join(" "));
    blocks.push(
      <p key={`${keyPrefix}-p-${blocks.length}`}>
        {renderInline(text, role, `${keyPrefix}-p-${blocks.length}`)}
      </p>
    );
    buffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul
        key={`${keyPrefix}-list-${blocks.length}`}
        className="space-y-1.5 ml-5 list-disc"
      >
        {listBuffer.map((item, idx) => (
          <li key={`${keyPrefix}-li-${idx}`}>
            {renderInline(item, role, `${keyPrefix}-li-${idx}`)}
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        blocks.push(
          <pre
            key={`${keyPrefix}-code-${blocks.length}`}
            className={`my-3 p-4 rounded-xl text-[14px] font-mono overflow-x-auto ${
              role === "assistant"
                ? "bg-gray-900 text-gray-100"
                : "bg-blue-700 text-white"
            }`}
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
      } else {
        flushParagraph();
        flushList();
      }
      inCode = !inCode;
      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      flushParagraph();
      listBuffer.push(line.trim().slice(2));
      return;
    }

    if (line.trim() === "") {
      flushParagraph();
      flushList();
      return;
    }

    buffer.push(line);
  });

  flushParagraph();
  flushList();

  return <div className="space-y-3">{blocks}</div>;
}

export default function ChatPage() {
  const [branding, setBranding] = useState<{ name: string; logoUrl: string | null }>({
    name: "SKOUTEX",
    logoUrl: null,
  });
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id ?? "");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const conversationButtonRefs = useRef<HTMLButtonElement[]>([]);

  const activeConversation = conversations.find((conv) => conv.id === activeId);
  const messages = activeConversation?.messages ?? [];

  const groupedConversations = useMemo(() => {
    const groups: Record<string, Conversation[]> = {
      Today: [],
      Yesterday: [],
      "Last 7 Days": [],
      Older: [],
    };
    conversations.forEach((conv) => {
      const bucket = categorizeConversation(conv.updatedAt);
      groups[bucket].push(conv);
    });
    return groups;
  }, [conversations]);

  const flatConversations = useMemo(() => {
    return ["Today", "Yesterday", "Last 7 Days", "Older"].flatMap(
      (key) => groupedConversations[key] ?? []
    );
  }, [groupedConversations]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    }
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isSidebarOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      hamburgerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch("/api/club/branding");
        if (!response.ok) return;
        const data = await response.json();
        setBranding({
          name: data?.name || "SKOUTEX",
          logoUrl: data?.logoUrl ?? null,
        });
      } catch {
        setBranding({ name: "SKOUTEX", logoUrl: null });
      }
    };
    fetchBranding();
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeId]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    const maxHeight = isMobile ? 100 : 120;
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
  }, [input, isMobile]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const message: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date(),
            }
          : conv
      )
    );
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      const response: ChatMessage = {
        id: `m-${Date.now()}-assistant`,
        role: "assistant",
        content:
          "Here is a quick direction: focus on **progressive passers** and players with high *ball recoveries*. Want a full shortlist?",
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeId
            ? {
                ...conv,
                messages: [...conv.messages, response],
                updatedAt: new Date(),
              }
            : conv
        )
      );
      setIsTyping(false);
    }, 800);
  };

  const handleRetryLoad = () => {
    setIsLoadingMessages(false);
    setLoadError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSend();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const placeholder = isMobile
    ? "Ask me anything..."
    : "Ask about players, transfers, tactics...";

  const handleConversationKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = conversationButtonRefs.current[index + 1];
      next?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = conversationButtonRefs.current[index - 1];
      prev?.focus();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <header
        className="fixed top-0 left-0 right-0 h-16 border-b border-gray-200 bg-white z-50"
        aria-label="Chat header"
      >
        <div className="h-full px-4 sm:px-6 flex items-center justify-between max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3">
            <button
              ref={hamburgerRef}
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Open conversations"
            >
              <MenuIcon className="w-5 h-5 text-gray-600" />
            </button>
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                className="w-8 h-8 rounded-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <span className="text-base font-semibold text-gray-900">
              {branding.name}
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Chat options"
              title="Chat options"
            >
              <MoreIcon className="w-5 h-5 text-gray-600" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  Clear conversation
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  Export as PDF
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  Delete conversation
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  Chat settings
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside
        className="fixed left-0 top-16 bottom-0 w-[280px] bg-gray-50 border-r border-gray-200 overflow-y-auto hidden md:block"
        aria-label="Conversation history"
      >
        <div className="p-4 border-b border-gray-200 bg-white">
          <button
            className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            aria-label="Start new conversation"
          >
            <span className="text-base leading-none">+</span>
            New Conversation
          </button>
        </div>
        <nav className="p-3 space-y-6" aria-label="Conversations grouped by date">
          {conversations.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No conversations yet</div>
          ) : (
            Object.entries(groupedConversations).map(([group, items]) => (
              <div key={group}>
                <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {group}
                </h3>
                <div className="space-y-1">
                  {items.map((conv) => {
                    const active = conv.id === activeId;
                    const index = flatConversations.findIndex((item) => item.id === conv.id);
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveId(conv.id)}
                        onKeyDown={(event) => handleConversationKeyDown(event, index)}
                        ref={(el) => {
                          if (el && index >= 0) conversationButtonRefs.current[index] = el;
                        }}
                        className={
                          active
                            ? "w-full px-3 py-2.5 rounded-lg text-left bg-blue-50 border border-blue-200"
                            : "w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 transition-colors group"
                        }
                        aria-label={`Conversation: ${conv.title}, ${formatMessageCount(
                          conv.messages.length || 1
                        )}`}
                      >
                        <p
                          className={
                            active
                              ? "text-sm font-medium text-blue-900 truncate"
                              : "text-sm font-medium text-gray-900 truncate group-hover:text-blue-600"
                          }
                        >
                          {conv.title}
                        </p>
                        <p
                          className={
                            active
                              ? "text-xs text-blue-600 mt-0.5"
                              : "text-xs text-gray-500 mt-0.5"
                          }
                        >
                          {formatMessageCount(Math.max(conv.messages.length, 1))}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </nav>
      </aside>

      <main className="flex-1 md:ml-[280px] mt-16 overflow-hidden bg-white">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-[calc(100vh-10rem)] overflow-y-auto"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          <div className="max-w-full md:max-w-[800px] mx-auto px-4 py-6 space-y-6 md:px-6 md:py-8">
            {isLoadingMessages ? (
              <div className="py-16 text-center text-gray-500">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                Loading messages...
              </div>
            ) : loadError ? (
              <div className="py-16 text-center text-gray-500">
                Failed to load conversation. Please try again.
                <div className="mt-4">
                  <button
                    onClick={handleRetryLoad}
                    className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Scout Assistant
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Ask me about players, transfers, tactics, or anything related to football scouting.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`animate-fade-in ${
                    message.role === "assistant"
                      ? "flex items-start gap-3"
                      : "flex items-start gap-3 justify-end"
                  }`}
                  role="article"
                  aria-label={
                    message.role === "assistant"
                      ? "Message from Scout Assistant"
                      : "Message from you"
                  }
                  style={{ animationDelay: `${index * 10}ms` }}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <BotIcon className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={
                      message.role === "assistant"
                        ? "flex-1 max-w-[85%] md:max-w-[600px]"
                        : "flex-1 max-w-[85%] md:max-w-[600px] flex justify-end"
                    }
                  >
                    <div
                      className={
                        message.role === "assistant"
                          ? "rounded-2xl rounded-tl-sm bg-gray-50 px-4 py-3 text-[15px] text-gray-900 leading-relaxed max-w-[85%] md:max-w-[600px]"
                          : "rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-[15px] text-white leading-relaxed max-w-[85%] md:max-w-[600px]"
                      }
                    >
                      {renderMarkdown(message.content, message.role, message.id)}
                    </div>
                    <span className="text-xs text-gray-400 ml-1 mt-1.5 hidden">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BotIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 max-w-[600px]">
                  <div className="rounded-2xl rounded-tl-sm bg-gray-50 px-4 py-3 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 chat-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 chat-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 chat-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 md:ml-[280px] h-20 md:h-24 bg-white border-t border-gray-200 z-40 pb-safe"
        aria-label="Send message"
      >
        <div className="h-full max-w-[800px] mx-auto px-4 flex items-center gap-3 sm:px-6">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              placeholder={placeholder}
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-[15px] text-gray-900 placeholder:text-gray-400 leading-relaxed transition-all max-h-[100px] md:max-h-[120px] overflow-y-auto"
              aria-label="Message input"
              aria-describedby="composer-hint"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                input.trim()
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              aria-label={input.trim() ? "Send message" : "Enter a message to send"}
            >
              <ArrowUpIcon className="w-5 h-5 text-white" />
            </button>
          </div>
          <span id="composer-hint" className="sr-only">
            Enter to send, Shift+Enter for new line
          </span>
        </div>
      </form>

      <button
        onClick={scrollToBottom}
        className={`fixed bottom-24 right-4 z-30 w-10 h-10 rounded-full bg-white border border-gray-300 shadow-lg hover:shadow-xl flex items-center justify-center transition-all md:bottom-28 md:right-8 ${
          showScrollButton ? "scroll-btn-visible" : "scroll-btn-hidden"
        }`}
        aria-label="Jump to latest message"
        title="Jump to latest"
      >
        <ChevronDownIcon className="w-5 h-5 text-gray-600" />
      </button>

      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "backdrop-visible" : "backdrop-hidden"
        }`}
        onClick={() => setIsSidebarOpen(false)}
        role="presentation"
      />
      <aside
        className={`fixed left-0 top-0 bottom-0 w-[80vw] max-w-[320px] bg-gray-50 z-50 md:hidden transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Conversation history"
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
          <span className="text-base font-semibold text-gray-900">Conversations</span>
          <button
            ref={closeButtonRef}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close conversations"
            onClick={() => setIsSidebarOpen(false)}
          >
            <XIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 border-b border-gray-200 bg-white">
          <button
            className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            aria-label="Start new conversation"
          >
            <span className="text-base leading-none">+</span>
            New Conversation
          </button>
        </div>
        <nav className="p-3 space-y-6" aria-label="Conversations grouped by date">
          {conversations.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No conversations yet</div>
          ) : (
            Object.entries(groupedConversations).map(([group, items]) => (
              <div key={group}>
                <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {group}
                </h3>
                <div className="space-y-1">
                  {items.map((conv) => {
                    const active = conv.id === activeId;
                    const index = flatConversations.findIndex((item) => item.id === conv.id);
                    return (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setActiveId(conv.id);
                          setIsSidebarOpen(false);
                        }}
                        onKeyDown={(event) => handleConversationKeyDown(event, index)}
                        ref={(el) => {
                          if (el && index >= 0) conversationButtonRefs.current[index] = el;
                        }}
                        className={
                          active
                            ? "w-full px-3 py-2.5 rounded-lg text-left bg-blue-50 border border-blue-200"
                            : "w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 transition-colors group"
                        }
                        aria-label={`Conversation: ${conv.title}, ${formatMessageCount(
                          conv.messages.length || 1
                        )}`}
                      >
                        <p
                          className={
                            active
                              ? "text-sm font-medium text-blue-900 truncate"
                              : "text-sm font-medium text-gray-900 truncate group-hover:text-blue-600"
                          }
                        >
                          {conv.title}
                        </p>
                        <p
                          className={
                            active
                              ? "text-xs text-blue-600 mt-0.5"
                              : "text-xs text-gray-500 mt-0.5"
                          }
                        >
                          {formatMessageCount(Math.max(conv.messages.length, 1))}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </nav>
      </aside>
    </div>
  );
}
