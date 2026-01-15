"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  User,
  Loader2,
  Volume2,
  TrendingUp,
  MapPin,
  Calendar,
  Target,
  ArrowRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";
import { formatCurrency, getPositionColor } from "@/lib/utils";
import { useFitScoreGate } from "@/lib/hooks/useFitScoreGate";
import FitScoreGateNotice from "@/components/FitScoreGateNotice";
import type { FitScoreGateResult } from "@/lib/club-context/fitScoreGate";
import type { ChatMessage } from "@/lib/types";

interface PlayerInfo {
  id: string;
  name: string;
  age: number;
  position: string;
  club: string;
  nationality: string;
  marketValue: number;
  contractExpiry?: string;
  goals?: number;
  assists?: number;
  appearances?: number;
  fitScore?: number;
  highlight: string;
}

interface ChatResponse {
  text?: string;
  message?: string;
  players?: PlayerInfo[];
  type: "recommendation" | "analysis" | "comparison" | "general" | "locked";
  missing_required_fields?: string[];
  blocking_missing_fields?: string[];
  actionUrl?: string;
}

const suggestedPrompts = [
  "Find right wingers under 25 with high dribble success rate",
  "Compare top CDM targets by defensive stats",
  "Which players have expiring contracts in top leagues?",
  "Analyze strikers available under €20M",
  "Show me undervalued players in Ligue 1",
  "What's the market trend for young center backs?",
];

// Mini player card for chat responses
function PlayerCard({
  player,
  gate,
  gateLoading,
}: {
  player: PlayerInfo;
  gate: FitScoreGateResult;
  gateLoading: boolean;
}) {
  const positionColorClass = getPositionColor(player.position);
  const fitScoreAllowed = !gateLoading && gate.unlocked;

  return (
    <Link
      href={`/dashboard/players/${player.id}`}
      className="block bg-[#f6f6f6] border border-gray-200 rounded-xl p-4 hover:border-[#0031FF]/50 hover:bg-[#0031FF]/5 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Player Avatar */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
            <span className="text-xl font-bold text-[#2C2C2C]">
              {player.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </span>
          </div>
          {/* Position Badge */}
          <div className={`absolute -bottom-1 -right-1 ${positionColorClass} text-white text-xs font-bold px-1.5 py-0.5 rounded`}>
            {player.position}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-[#2C2C2C] truncate group-hover:text-[#0031FF] transition-colors">
              {player.name}
            </h4>
            <span className="text-xs text-gray-500">{player.age}y</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {player.club}
            </span>
            {player.contractExpiry && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {player.contractExpiry.split("-")[0]}
              </span>
            )}
          </div>

          {/* Highlight */}
          <p className="text-sm text-gray-600 line-clamp-2">{player.highlight}</p>
        </div>

        {/* Stats Column */}
        <div className="flex flex-col items-end gap-1">
          <div className="text-right">
            <p className="text-sm font-bold text-[#2C2C2C]">{formatCurrency(player.marketValue)}</p>
            <p className="text-xs text-gray-500">Market Value</p>
          </div>
          {fitScoreAllowed ? (
            player.fitScore && (
              <div className="flex items-center gap-1.5 mt-1">
                <Target className="w-3.5 h-3.5 text-[#0031FF]" />
                <span className="text-sm font-semibold text-[#0031FF]">{player.fitScore}%</span>
                <span className="text-xs text-gray-500">Fit</span>
              </div>
            )
          ) : (
            !gateLoading && <FitScoreGateNotice gate={gate} />
          )}
        </div>
      </div>

      {/* Stats Row */}
      {(player.goals !== undefined || player.assists !== undefined || player.appearances !== undefined) && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
          {player.goals !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Goals</span>
              <span className="text-sm font-medium text-[#2C2C2C]">{player.goals}</span>
            </div>
          )}
          {player.assists !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Assists</span>
              <span className="text-sm font-medium text-[#2C2C2C]">{player.assists}</span>
            </div>
          )}
          {player.appearances !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Apps</span>
              <span className="text-sm font-medium text-[#2C2C2C]">{player.appearances}</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 text-[#0031FF] text-xs font-medium group-hover:translate-x-1 transition-transform">
            View Profile <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      )}
    </Link>
  );
}

// Parse assistant message to check for structured response
function parseAssistantResponse(content: string): ChatResponse | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export default function ChatPage() {
  const { chatMessages, addChatMessage } = useAppStore();
  const { gate, loading: gateLoading } = useFitScoreGate();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      // Store the structured response as JSON string
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: JSON.stringify(data),
        timestamp: new Date(),
      };

      addChatMessage(assistantMessage);
    } catch (error) {
      console.error("Chat error:", error);
      addChatMessage({
        id: uuidv4(),
        role: "assistant",
        content: JSON.stringify({
          text: "I'm sorry, there was an error processing your request. Please try again.",
          type: "general"
        }),
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual audio recording with Web Speech API or Whisper
    if (!isRecording) {
      // Start recording simulation
      setTimeout(() => {
        setIsRecording(false);
        setInput("Find me a young striker with good aerial ability");
      }, 2000);
    }
  };

  // Render assistant message with visual content
  const renderAssistantMessage = (message: ChatMessage) => {
    const parsed = parseAssistantResponse(message.content);

    if (!parsed) {
      // Fallback to plain text
      return (
        <div className="prose prose-sm max-w-none">
          {message.content.split("\n").map((line, i) => (
            <p key={i} className="mb-2 last:mb-0 text-gray-700">
              {line}
            </p>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Text Response */}
        <div className="prose prose-sm max-w-none">
          {(parsed.text || parsed.message || "").split("\n").map((line, i) => (
            <p key={i} className="mb-2 last:mb-0 text-gray-700">
              {line}
            </p>
          ))}
        </div>

        {/* Player Cards */}
        {parsed.players && parsed.players.length > 0 && (
          <div className="space-y-3 mt-4">
            {parsed.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                gate={gate}
                gateLoading={gateLoading}
              />
            ))}
          </div>
        )}

        {/* Response Type Badge */}
        {parsed.type !== "general" && parsed.type !== "locked" && (
          <div className="flex items-center gap-2 pt-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              parsed.type === "recommendation"
                ? "bg-[#0031FF]/20 text-[#0031FF]"
                : parsed.type === "analysis"
                ? "bg-purple-500/20 text-purple-400"
                : "bg-green-500/20 text-green-400"
            }`}>
              {parsed.type === "recommendation" && "AI Recommendation"}
              {parsed.type === "analysis" && "Player Analysis"}
              {parsed.type === "comparison" && "Comparison"}
            </span>
          </div>
        )}

        {parsed.type === "locked" && (
          <FitScoreGateNotice
            gate={{
              unlocked: false,
              missing_required_fields: parsed.missing_required_fields || [],
              blocking_missing_fields: parsed.blocking_missing_fields || [],
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <Header title="AI Scout Assistant" subtitle="Powered by advanced AI" />

      <div className="flex flex-col h-[calc(100vh-64px)] w-full max-w-[100vw] lg:max-w-none overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
          {chatMessages.length === 0 ? (
            <div className="max-w-3xl mx-auto">
              {/* Welcome */}
              <div className="text-center mb-8 pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0031FF] to-[#0050FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-500">
                  Ask me about players, transfers, tactics, or market insights
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="grid sm:grid-cols-2 gap-3">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-[#0031FF]/50 hover:bg-[#0031FF]/5 transition-all group"
                  >
                    <p className="text-sm text-gray-600 group-hover:text-[#2C2C2C] transition-colors">
                      {prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0031FF] to-[#0050FF] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`${
                      message.role === "user"
                        ? "max-w-[80%] bg-[#0031FF] text-white rounded-2xl rounded-tr-md px-4 py-3"
                        : "flex-1 bg-white border border-gray-200 text-gray-700 rounded-2xl rounded-tl-md px-4 py-4"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        {message.content.split("\n").map((line, i) => (
                          <p key={i} className="mb-2 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : (
                      renderAssistantMessage(message)
                    )}

                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button className="p-1.5 text-gray-500 hover:text-[#2C2C2C] transition-colors">
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0031FF] to-[#0050FF] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-[#f6f6f6]">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto"
          >
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about players, transfers, or tactics..."
                rows={1}
                className="w-full px-4 py-3 pr-24 bg-white border border-gray-200 rounded-xl text-[#2C2C2C] placeholder-gray-500 resize-none focus:outline-none focus:border-[#0031FF] transition-all"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Voice Input */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-2 rounded-lg transition-all ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "text-gray-500 hover:text-[#2C2C2C] hover:bg-gray-100"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                {/* Send */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-[#0031FF] text-white rounded-lg hover:bg-[#0028cc] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-2">
              AI responses are based on available data. Always verify critical
              decisions with additional sources.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
