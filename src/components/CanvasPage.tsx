import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Plus,
  Trash2,
  Code as CodeIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  ArrowUpRight,
  X,
  Globe,
  Play,
  Sun,
  CloudRain,
  Cloud,
  CloudSnow,
  Wind,
  Send,
  ExternalLink,
  ShieldCheck,
  Github,
  MessageSquare,
  Newspaper
} from "lucide-react";
import { CanvasItem } from "../types";

interface CanvasPageProps {
  canvasItems: CanvasItem[];
  setCanvasItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
  sendTextContext?: (overrideText?: string) => void;
  connected?: boolean;
}

export default function CanvasPage({ 
  canvasItems, 
  setCanvasItems, 
  sendTextContext, 
  connected 
}: CanvasPageProps) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardType, setNewCardType] = useState<"text" | "image" | "link" | "code">("text");
  const [newCardContent, setNewCardContent] = useState("");

  const handleAddCanvasItem = () => {
    if (!newCardTitle.trim() || !newCardContent.trim()) return;
    const newItem: CanvasItem = {
      id: String(Date.now()),
      type: newCardType,
      title: newCardTitle,
      content: newCardContent,
      timestamp: new Date().toLocaleTimeString(),
    };
    setCanvasItems((prev) => [newItem, ...prev]);
    setNewCardTitle("");
    setNewCardContent("");
    setShowAddCard(false);
  };

  const handleDeleteCanvasItem = (id: string) => {
    setCanvasItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCanvas = () => {
    setCanvasItems([]);
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-4 min-h-[600px] lg:min-h-[730px]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-500 animate-pulse" />
            <h2 className="text-xs font-bold text-gray-200 uppercase tracking-widest font-mono">Drawing Board Visual Output</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCard(!showAddCard)}
              className="px-2.5 py-1 text-[10px] rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              কার্ড যোগ করুন
            </button>
            {canvasItems.length > 0 && (
              <button
                onClick={clearCanvas}
                className="text-[10px] text-gray-500 hover:text-rose-400 hover:underline flex items-center gap-1 transition-all cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                ক্লিয়ার
              </button>
            )}
          </div>
        </div>

        {/* Inline Card Builder */}
        <AnimatePresence>
          {showAddCard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-stone-950/80 border border-white/5 rounded-2xl p-4 mb-4 space-y-3 flex-shrink-0"
            >
              <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">কাস্টম কার্ড তৈরি করুন</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="কার্ডের শিরোনাম (Title)"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  className="h-8 bg-stone-900 border border-white/5 rounded-lg px-3 text-xs text-gray-200 placeholder:text-gray-500 outline-none"
                />
                <div className="flex bg-stone-900 p-0.5 rounded-lg border border-white/5 gap-1">
                  {(["text", "code", "link", "image"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewCardType(type)}
                      className={`flex-1 text-[9px] font-bold uppercase rounded-md transition-all py-1 cursor-pointer ${
                        newCardType === type
                          ? "bg-pink-500 text-stone-950 shadow-xs"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                placeholder={
                  newCardType === "code"
                    ? "এখানে কোড লিখুন..."
                    : newCardType === "link"
                    ? "https:// বা http:// দিয়ে লিংক দিন..."
                    : newCardType === "image"
                    ? "ছবির লিংক দিন..."
                    : "কার্ডের বিবরণ লিখুন..."
                }
                value={newCardContent}
                onChange={(e) => setNewCardContent(e.target.value)}
                className="w-full bg-stone-900 border border-white/5 rounded-xl p-3 text-xs text-gray-200 placeholder:text-gray-500 outline-none resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddCard(false)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleAddCanvasItem}
                  disabled={!newCardTitle.trim() || !newCardContent.trim()}
                  className="px-4 py-1.5 rounded-lg text-[10px] font-bold bg-pink-500 text-stone-950 hover:bg-pink-400 transition-all disabled:opacity-40 cursor-pointer"
                >
                  সংরক্ষণ
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 select-text">
          <AnimatePresence initial={false}>
            {canvasItems.map((item) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                className="bg-stone-950/60 hover:bg-stone-950/85 border border-white/5 rounded-2xl p-5 space-y-3 transition-colors duration-300 relative group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white tracking-tight flex items-center gap-1.5 uppercase">
                    {item.type === "code" && <CodeIcon className="h-3.5 w-3.5 text-amber-400" />}
                    {item.type === "link" && <LinkIcon className="h-3.5 w-3.5 text-indigo-400" />}
                    {item.type === "text" && <Sparkles className="h-3.5 w-3.5 text-pink-400" />}
                    {item.type === "image" && <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />}
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-gray-500">{item.timestamp}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.content);
                      }}
                      className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] text-gray-400 hover:text-white transition-all cursor-pointer"
                      title="কপি করুন"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleDeleteCanvasItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 transition-all p-0.5 cursor-pointer"
                      title="কার্ড মুছুন"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {item.type === "code" ? (
                  <pre className="bg-stone-900 border border-white/5 rounded-xl p-3.5 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed select-text">
                    <code>{item.content}</code>
                  </pre>
                ) : item.type === "link" ? (
                  <div className="w-full space-y-3 text-left">
                    {(() => {
                      const url = item.content;
                      
                      // 1. YouTube Video Match
                      const isYT = url.includes("youtube.com") || url.includes("youtu.be");
                      if (isYT) {
                        let videoId: string | null = null;
                        if (url.includes("youtu.be/")) {
                          const parts = url.split("youtu.be/");
                          if (parts[1]) videoId = parts[1].split(/[?#]/)[0];
                        } else if (url.includes("embed/")) {
                          const parts = url.split("embed/");
                          if (parts[1]) videoId = parts[1].split(/[?#]/)[0];
                        } else if (url.includes("v=")) {
                          const parts = url.split("v=");
                          if (parts[1]) videoId = parts[1].split(/[&?#]/)[0];
                        }

                        const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

                        return (
                          <div className="space-y-3">
                            {embedUrl ? (
                              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black">
                                <iframe
                                  src={embedUrl}
                                  className="absolute inset-0 w-full h-full border-none"
                                  title="YouTube Video Player"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <div className="p-4 bg-red-950/15 border border-red-500/20 rounded-xl space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                  <span className="text-[10px] font-bold text-red-400 font-mono tracking-wider uppercase">YouTube Dashboard</span>
                                </div>
                                <p className="text-[11px] text-gray-300">যেকোনো ভিডিও বা কন্টেন্ট প্লে করতে নিচের ট্রেন্ডিং এআই টিউটোরিয়াল ফিড থেকে একটি বেছে নিন বা উপর থেকে লিংক দিন।</p>
                              </div>
                            )}

                            {/* Simulated Feed */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-sans">
                              {[
                                { title: "Conversation with Sassy Zoya AI", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", desc: "প্রথম দিন জোয়ার চমৎকার পারফরমেন্স ও দুষ্টু মিষ্টি টোন।" },
                                { title: "Multimodal Gemini API Tutorial", url: "https://www.youtube.com/watch?v=Ke90Tje7VS0", desc: "রিয়েলটাইম অডিও স্ট্রিম এবং ভয়েস প্রসেসিং গাইডলাইন।" },
                                { title: "Late Night Coding Lofi Beats", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", desc: "মনোযোগ বৃদ্ধির জন্য শান্ত বাংলা ও সাই-ফাই ব্যাকগ্রাউন্ড ট্র্যাক।" }
                              ].map((v, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    // Replace this item with the selected video url
                                    setCanvasItems(prev => prev.map(c => c.id === item.id ? { ...c, content: v.url, title: `🎬 ${v.title}` } : c));
                                    if (sendTextContext) {
                                      sendTextContext(`জোয়া, আমি ইউটিউব ভিডিও "${v.title}" লোড করেছি। এই বিষয়ের ওপরে তোমার মজার বা স্যান্ডবক্স মতামত কী?`);
                                    }
                                  }}
                                  className="p-2 border border-white/5 bg-stone-900 hover:border-red-500/20 rounded-xl hover:bg-stone-950/80 text-left transition-all truncate text-gray-300 hover:text-white cursor-pointer block w-full"
                                >
                                  <div className="font-bold flex items-center gap-1.5 text-white">🎬 {v.title}</div>
                                  <div className="text-[9px] text-gray-400 font-normal truncate mt-0.5">{v.desc}</div>
                                </button>
                              ))}
                            </div>

                            <div className="flex justify-between items-center bg-stone-900 px-3.5 py-2.5 border border-white/5 rounded-xl text-[10px]">
                              <span className="text-gray-400 font-mono text-[9px] truncate max-w-[150px]">{url}</span>
                              <a href={url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-bold">
                                মূল সাইটে যান <ArrowUpRight className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        );
                      }

                      // 2. Wikipedia Match
                      if (url.includes("wikipedia.org")) {
                        const articleMatch = url.match(/\/wiki\/([^?#]+)/);
                        const articleTitle = articleMatch 
                          ? decodeURIComponent(articleMatch[1].replace(/_/g, " ")) 
                          : "উইকিপিডিয়া (Wikipedia)";
                        return (
                          <div className="space-y-3 font-sans text-stone-200">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-2.5">
                              <span className="text-xl font-serif text-white font-extrabold italic bg-white/5 h-8 w-8 rounded-lg flex items-center justify-center border border-white/10">W</span>
                              <div>
                                <h3 className="text-xs font-bold text-white tracking-widest font-serif">WIKIPEDIA ENCYCLOPEDIA</h3>
                                <p className="text-[9px] text-gray-500">The Free Collaborative Encyclopedia</p>
                              </div>
                            </div>
                            
                            <div className="p-3.5 bg-indigo-950/5 border border-indigo-500/10 rounded-xl space-y-2">
                              <h4 className="text-xs font-bold text-indigo-300">{articleTitle}</h4>
                              <p className="text-[11px] text-stone-300 leading-relaxed font-normal">
                                {articleMatch 
                                  ? `আপনার নির্দেশিত উইকিপিডিয়ার "${articleTitle}" পৃষ্ঠাটি সাফল্যের সাথে ড্যাশবোর্ডে সংযোজন করা হয়েছে। আপনি চাইলে নিচে এক ক্লিকে জোয়াকে জিজ্ঞেস করতে পারেন!`
                                  : "উইকিপিডিয়া একটি উন্মুক্ত বহুমাত্রিক জ্ঞানভাণ্ডার। জোয়ার মাল্টিমোডাল ব্রেইন যেকোনো উইকিপিডিয়া তথ্যের দারুণ রসাত্মক ব্যাখ্যা দিতে প্রস্তুত।"
                                }
                              </p>
                              <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                "আজকের নির্বাচিত নিবন্ধ: রবীন্দ্রনাথ ঠাকুর ছিলেন একজন নোবেলজয়ী কবি ও বহুমুখী প্রতিভা যিনি বাংলা সাহিত্যকে বিশ্বদরবারে তুলে ধরেছেন।"
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (sendTextContext) {
                                    sendTextContext(`জোয়া, উইকিপিডিয়ার "${articleTitle}" আর্টিকেল সম্পর্কে তোমার কোনো গভীর বা রসাত্মক ধারণা বলো তো!`);
                                  }
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-pink-500 text-stone-950 hover:bg-pink-400 text-[10px] font-bold text-center transition-all cursor-pointer"
                              >
                                💬 জোয়াকে জিজ্ঞেস করুন (Ask Zoya)
                              </button>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-[10px] uppercase font-bold text-gray-300 transition-all flex items-center gap-1"
                              >
                                Original <ArrowUpRight className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        );
                      }

                      // 3. News / Google Search Match
                      if (url.includes("news.google") || url.includes("google.com/search") || url.includes("q=")) {
                        const isSearch = url.includes("search") || url.includes("q=");
                        const queryMatch = url.match(/[?&]q=([^&]+)/);
                        const searchQuery = queryMatch ? decodeURIComponent(queryMatch[1].replace(/\+/g, " ")) : "বিজ্ঞান ও প্রযুক্তি সংবাদ";

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-wider uppercase">
                                {isSearch ? "🔍 Search Results Monitor" : "📰 Live Google News BD"}
                              </span>
                              <span className="text-[9px] text-gray-500 font-mono">{searchQuery}</span>
                            </div>

                            <div className="space-y-2.5">
                              {[
                                {
                                  title: isSearch ? `স্মার্ট অডিও ইন্টারফেস ও জেনারেটিভ এআই: "${searchQuery}"` : "বাংলাদেশ বিজ্ঞান ও প্রযুক্তির বিপ্লব: জোয়া এআই মডেল ও মানুষের সরাসরি কনভারসেশন",
                                  source: "Prothom Alo Tech",
                                  time: "২ ঘণ্টা আগে",
                                  snippet: "বাংলা ভাষায় দক্ষ এবং রোমান্টিক টোনে কথা বলা জোয়া ব্রেইন ফ্রেমওয়ার্কটির কার্যকারিতা সফলভাবে রিয়েল-টাইম টেস্টিং করা হচ্ছে। ব্যবহারকারীরা সন্তোষ প্রকাশ করেছেন।"
                                },
                                {
                                  title: isSearch ? `গবেষণা ও উন্নয়ন প্রশ্নমালা: "${searchQuery}"` : "দেশজুড়ে তাপমাত্রা বৃদ্ধি ও বৈরী আবহাওয়া: আবহাওয়া অফিসের সতর্কতা",
                                  source: "BBC News Bangla",
                                  time: "৫ ঘণ্টা আগে",
                                  snippet: "বিভিন্ন জেলায় তাপমাত্রা বৃদ্ধি অব্যাহত রয়েছে। বর্ষাকালীন বৃষ্টির পাশাপাশি উত্তর-পূর্বাঞ্চলে হালকা বজ্রসহ কালবৈশাখী ঝড়ের ইঙ্গিত রয়েছে।"
                                }
                              ].map((item, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    if (sendTextContext) {
                                      sendTextContext(`জোয়া, সার্চ/নিউজ আপডেট "${item.title}" নিয়ে তোমার প্রতিক্রিয়া বলো!`);
                                    }
                                  }}
                                  className="p-2.5 bg-stone-900 border border-white/5 rounded-xl hover:border-pink-500/20 hover:bg-stone-950/40 transition-all duration-200 cursor-pointer text-left"
                                >
                                  <div className="flex justify-between text-[8px] text-pink-400 font-mono mb-1">
                                    <span>{item.source}</span>
                                    <span>{item.time}</span>
                                  </div>
                                  <h5 className="text-[11px] font-extrabold text-white leading-tight">{item.title}</h5>
                                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed font-normal">{item.snippet}</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center bg-stone-900 px-3 py-2 border border-white/5 rounded-xl text-[10px]">
                              <span className="text-gray-400 font-mono text-[9px] truncate max-w-[150px]">{url}</span>
                              <a href={url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 font-bold">
                                Open <ArrowUpRight className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        );
                      }

                      // 4. ChatGPT Match
                      if (url.includes("chatgpt.com")) {
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                              <MessageSquare className="h-4 w-4 text-emerald-400" />
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Assistant Chat Console</h4>
                                <p className="text-[9px] text-gray-500 font-mono">Live Prompt Portal</p>
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-300 leading-relaxed font-normal">
                              ক্যানভাসে সরাসরি সংযুক্ত চ্যাট মডেল। নিচের বক্সে আপনার পছন্দের এআই প্রম্পট লিখুন। আপনি লিখলেই জোয়া সরাসরি বাংলা জবাবে আপনার সাথে কথা বলা শুরু করবে!
                            </p>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="কোড সাহায্য, ম্যাথ বা সায়েন্স প্রশ্ন জিজ্ঞেস করুন..."
                                className="flex-1 bg-stone-905 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-indigo-300 outline-none focus:border-emerald-500/30 font-sans"
                                id={`chat-prompt-${item.id}`}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const val = e.currentTarget.value.trim();
                                    if (val && sendTextContext) {
                                      sendTextContext(`জোয়া, এআই প্রম্পট হিসেবে এটার উত্তর দাও: "${val}"`);
                                      e.currentTarget.value = "";
                                    }
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  const el = document.getElementById(`chat-prompt-${item.id}`) as HTMLInputElement;
                                  const val = el?.value?.trim();
                                  if (val && sendTextContext) {
                                    sendTextContext(`জোয়া, এআই প্রম্পট হিসেবে এটার উত্তর দাও: "${val}"`);
                                    el.value = "";
                                  }
                                }}
                                className="px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                পাঠান
                              </button>
                            </div>
                          </div>
                        );
                      }

                      // 5. GitHub Match
                      if (url.includes("github.com")) {
                        return (
                          <div className="space-y-3 font-sans text-stone-200">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-2.5">
                              <Github className="h-5 w-5 text-white" />
                              <div>
                                <h3 className="text-xs font-bold text-white tracking-widest uppercase">GITHUB REPOSITORY</h3>
                                <p className="text-[9px] text-gray-500">Safe Sandbox Source Control</p>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-stone-900 border border-white/5 rounded-xl flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-white">zoya-voice-assistant-react</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5 font-normal">Real-time multimodal conversational brain with motion detection vision overlay.</p>
                              </div>
                              <button
                                className="px-2.5 py-1 text-[9px] font-bold uppercase rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer"
                                onClick={() => {
                                  if (sendTextContext) {
                                    sendTextContext("জোয়া, তুমি কি এই গিটহাব প্রজেক্টের কোডিং আর্কিটেকচার নিয়ে কিছু গভীর লজিক আমার সাথে শেয়ার করবে?");
                                  }
                                }}
                              >
                                Explore
                              </button>
                            </div>

                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-center block w-full py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-[10px] uppercase font-bold text-gray-300 transition-all"
                            >
                              Open Safe Repo Link <ArrowUpRight className="h-3 w-3 inline ml-1" />
                            </a>
                          </div>
                        );
                      }

                      // 6. Weather Match
                      if (url.includes("weather.com") || url.includes("forecast") || item.title.toLowerCase().includes("weather") || item.content.toLowerCase().includes("weather")) {
                        return (
                          <div className="bg-gradient-to-br from-indigo-950/20 to-stone-950/50 border border-white/10 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-indigo-400 font-mono uppercase font-extrabold tracking-wider">পরিবেশ ও আবহাওয়া ট্র্যাকার</span>
                                <h4 className="text-sm font-extrabold text-white">ঢাকা, বাংলাদেশ</h4>
                              </div>
                              <Sun className="h-8 w-8 text-amber-400 animate-spin-slow" />
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-stone-900/60 p-2 rounded-xl border border-white/5">
                                <span className="text-[9px] text-gray-400 block font-normal">तापমাত্রা</span>
                                <span className="text-xs font-extrabold text-pink-400 font-mono">৩২° সে.</span>
                              </div>
                              <div className="bg-stone-900/60 p-2 rounded-xl border border-white/5">
                                <span className="text-[9px] text-gray-400 block font-normal">আর্দ্রতা</span>
                                <span className="text-xs font-extrabold text-cyan-400 font-mono">৮২%</span>
                              </div>
                              <div className="bg-stone-900/60 p-2 rounded-xl border border-white/5">
                                <span className="text-[9px] text-gray-400 block font-normal">বাতাস</span>
                                <span className="text-xs font-extrabold text-amber-400 font-mono">১৪ কিমি/ঘণ্টা</span>
                              </div>
                            </div>

                            <p className="text-[10px] text-gray-400 leading-relaxed font-normal flex-1">
                              আজকের দিনে মেঘ ও রোদের চমৎকার খেলা থাকবে। হালকা দমকা হাওয়া থাকতে পারে যা তাপমাত্রা কিছুটা সহনীয় রাখবে।
                            </p>

                            <button
                              onClick={() => {
                                  if (sendTextContext) {
                                    sendTextContext("জোয়া, ঢাকার আজকের আবহাওয়া এবং কালবৈশাখী সম্ভাবনা নিয়ে তোমার মিষ্টি ভয়েস আপডেট দাও!");
                                  }
                              }}
                              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              ☀ আবহাওয়ার আপডেট দিন (Ask Zoya)
                            </button>
                          </div>
                        );
                      }

                      // Generic Link fallback
                      return (
                        <div className="w-full">
                          <div className="bg-stone-900 border border-white/15 rounded-xl p-3 flex items-center justify-between transition-all">
                            <div className="flex items-center gap-2 truncate pr-2">
                              <Globe className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                              <span className="text-xs text-stone-200 font-medium truncate font-mono">{url}</span>
                            </div>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="h-7 px-2.5 rounded-lg bg-pink-500 text-stone-950 font-bold text-[10px] uppercase flex items-center gap-1 hover:bg-pink-400 tracking-wider transition-all"
                            >
                              Open <ArrowUpRight className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : item.type === "image" ? (
                  <div className="space-y-2 text-left">
                    {(() => {
                      const isUrlOrBase64 = item.content.startsWith("http") || item.content.startsWith("data:image/");
                      const imgSrc = isUrlOrBase64 
                        ? item.content 
                        : `https://image.pollinations.ai/p/${encodeURIComponent(item.content)}?width=400&height=300&enhance=true`;
                      
                      return (
                        <div className="relative group overflow-hidden rounded-xl border border-white/5 bg-black/20">
                          <img 
                            src={imgSrc} 
                            className="w-full rounded-xl object-contain max-h-64 transition-transform duration-300 group-hover:scale-[1.02]" 
                            alt={item.title || "Zoya Image Output"} 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallbackPrompt = `${item.title || ""} ${item.content || "cute puppy"}`.trim().substring(0, 100);
                              const fallbackUrl = `https://image.pollinations.ai/p/${encodeURIComponent(fallbackPrompt)}?width=400&height=300&enhance=true`;
                              if (target.src !== fallbackUrl) {
                                target.src = fallbackUrl;
                              }
                            }}
                          />
                          {!isUrlOrBase64 && (
                            <span className="absolute bottom-2 left-2 bg-stone-900/80 border border-white/5 text-[9px] font-mono text-pink-400 px-1.5 py-0.5 rounded backdrop-blur-md">
                              AI Generated
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-xs text-gray-300 leading-relaxed text-left whitespace-pre-line leading-relaxed text-stone-200">
                    {item.content}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
  );
}
