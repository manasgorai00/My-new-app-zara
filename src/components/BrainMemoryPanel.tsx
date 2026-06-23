import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Trash2, Plus, X, Tag, Heart, Info, Check } from "lucide-react";
import { MemoryItem } from "../types";

interface BrainMemoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  memory: MemoryItem[];
  onDeleteMemory: (key: string) => void;
  onAddMemory: (key: string, value: string, category: "personal" | "preferences" | "facts" | "other") => void;
}

export default function BrainMemoryPanel({
  isOpen,
  onClose,
  memory,
  onDeleteMemory,
  onAddMemory,
}: BrainMemoryPanelProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCategory, setNewCategory] = useState<"personal" | "preferences" | "facts" | "other">("preferences");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSuccessBubble, setIsSuccessBubble] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    onAddMemory(newKey.trim().toLowerCase(), newValue.trim(), newCategory);
    setNewKey("");
    setNewValue("");
    setIsSuccessBubble(true);
    setTimeout(() => setIsSuccessBubble(false), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "personal":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "preferences":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "facts":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-stone-500/10 text-stone-400 border-stone-500/20";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-stone-900 border-l border-white/5 shadow-2xl z-50 flex flex-col justify-between"
            id="brain-memory-sidebar"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Brain className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-100 uppercase tracking-widest">
                    জোয়ার স্মৃতিভান্ডার
                  </h2>
                  <p className="text-[10px] text-pink-400 font-mono tracking-wider">
                    Zoya's Relationship Memory
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
                id="btn-close-memory"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Add Custom Memory Trigger Toggle */}
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/40 hover:to-purple-600/40 border border-pink-500/20 hover:border-pink-500/40 flex items-center justify-center gap-2 text-xs font-bold text-pink-300 transition-all cursor-pointer"
                  id="btn-reveal-add-memory"
                >
                  <Plus className="h-4 w-4" />
                  নতুন স্মৃতি যোগ করুন (Add Custom Memory)
                </button>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="bg-stone-950/70 p-5 rounded-2xl border border-pink-500/30 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      স্মৃতি লিখুন
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-stone-400 hover:text-white transition-all"
                    >
                      বাতিল
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                        কিওয়ার্ড (Key)
                      </label>
                      <input
                        type="text"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder="e.g. user_nickname, fav_movie"
                        className="w-full h-9 bg-stone-900 border border-white/5 rounded-xl px-3 text-xs outline-none focus:border-pink-500 transition-all text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                        স্মৃতি বিবরণ (Value)
                      </label>
                      <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="e.g. রূপম (Zoya calls me this)"
                        className="w-full h-9 bg-stone-900 border border-white/5 rounded-xl px-3 text-xs outline-none focus:border-pink-500 transition-all text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                        ধরন (Category)
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full h-9 bg-stone-900 border border-white/5 rounded-xl px-2 text-xs outline-none focus:border-pink-500 transition-all text-gray-300"
                      >
                        <option value="personal">ব্যক্তিগত (Personal)</option>
                        <option value="preferences">পছন্দ/অপছন্দ (Preferences)</option>
                        <option value="facts">সাধারণ তথ্য (Facts)</option>
                        <option value="other">অন্যান্য (Other)</option>
                      </select>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 h-9 rounded-xl bg-pink-500 text-stone-950 text-xs font-bold hover:bg-pink-400 transition-all cursor-pointer"
                      >
                        মনে রাখুন (Save Memory)
                      </button>
                      {isSuccessBubble && (
                        <div className="px-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center text-xs animate-bounce">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.form>
              )}

              {/* Memory List */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  জোয়া যা মনে রেখেছে ({memory.length})
                </span>

                {memory.length === 0 ? (
                  <div className="bg-stone-950/40 border border-white/5 rounded-2xl p-6 text-center text-xs text-gray-500 leading-relaxed">
                    <Info className="h-5 w-5 text-pink-500/40 mx-auto mb-2" />
                    জোয়ার মেমরিতে এখন চ্যাটের কোনো তথ্য নেই। জোয়ার সাথে কথা বলুন, সে অবলীলায় নিজে থেকেই আপনার নাম, মুড আর পছন্দের জিনিস মনে রাখবে!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {memory.map((item) => (
                      <motion.div
                        layout
                        key={item.key}
                        className="bg-stone-950/40 hover:bg-stone-950/70 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3 group transition-all"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-200">
                              {item.key}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-pink-100 font-medium">
                            {item.value}
                          </p>
                        </div>

                        <button
                          onClick={() => onDeleteMemory(item.key)}
                          className="h-8 w-8 rounded-full bg-white/0 hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all cursor-pointer"
                          title="স্মৃতি মুছে ফেলুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-stone-950/30 text-center text-[10px] text-gray-500 font-mono tracking-wide leading-relaxed">
              Zoya locally prioritizes these facts inside the persistent browser local storage context.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
