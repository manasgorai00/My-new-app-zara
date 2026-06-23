import React from "react";
import { motion } from "motion/react";
import {
  Settings2,
  User,
  SlidersHorizontal,
  Trash2,
  Mic,
  RefreshCw,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { SessionState } from "../types";

interface SettingsPageProps {
  voiceMatchSaved: boolean;
  setVoiceMatchSaved: React.Dispatch<React.SetStateAction<boolean>>;
  voiceSignature: string;
  setVoiceSignature: React.Dispatch<React.SetStateAction<string>>;
  enrolledUserName: string;
  setEnrolledUserName: (name: string) => void;
  voiceEnrollState: "idle" | "recording" | "analyzing" | "completed";
  setVoiceEnrollState: (state: "idle" | "recording" | "analyzing" | "completed") => void;
  startVoiceEnrollmentProcess: () => void;
  voiceLockEnabled: boolean;
  setVoiceLockEnabled: (enabled: boolean) => void;
  securityThreshold: number;
  setSecurityThreshold: (threshold: number) => void;
  detectedMood: "happy" | "melancholy" | "excited" | "calm" | "thinking" | "neutral";
  setDetectedMood: (mood: "happy" | "melancholy" | "excited" | "calm" | "thinking" | "neutral") => void;
  setSubtitles: (text: string) => void;
  connected: boolean;
  status: SessionState;
  zoyaSpeechSpeed: number;
  emotionSensitivity: number;
  liveMatchRate: number;
}

export default function SettingsPage({
  voiceMatchSaved,
  setVoiceMatchSaved,
  voiceSignature,
  setVoiceSignature,
  enrolledUserName,
  setEnrolledUserName,
  voiceEnrollState,
  setVoiceEnrollState,
  startVoiceEnrollmentProcess,
  voiceLockEnabled,
  setVoiceLockEnabled,
  securityThreshold,
  setSecurityThreshold,
  detectedMood,
  setDetectedMood,
  setSubtitles,
  connected,
  status,
  zoyaSpeechSpeed,
  emotionSensitivity,
  liveMatchRate,
}: SettingsPageProps) {
  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col justify-between space-y-4 flex-1 transition-all duration-300 min-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4.5 w-4.5 text-pink-500 animate-spin-slow" />
            <h2 className="text-xs font-black text-gray-200 uppercase tracking-widest font-mono">
              ডিভাইস সেটিংস ও ভয়েস সুরক্ষা
            </h2>
          </div>
          <span className="text-[10px] bg-pink-500/15 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/20 font-bold uppercase font-mono">
            zoya-v4.0
          </span>
        </div>

        {/* Settings Grid Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-sm max-h-[520px] scrollbar-thin">
          
          {/* Section A: Voice Match Authorization */}
          <div className="p-4 bg-stone-950/80 border border-white/5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-pink-400" />
                <h4 className="text-xs font-black text-gray-100 uppercase tracking-wider">কণ্ঠস্বর রেজিস্ট্রি (Voice Match Profile)</h4>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                voiceMatchSaved 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/25"
              }`}>
                {voiceMatchSaved ? "🔒 registered" : "⚠️ keys missing"}
              </span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              আপনার নিজস্ব কণ্ঠ রেকর্ডের মাধ্যমে জোয়ার স্পিকার আইডেন্টিটি এনভায়রনমেন্ট কনফিগার করুন। এতে অন্য কেউ জোয়ার সাথে কথা বলার চেষ্টা করলে জোয়া তা বুঝতে পারবে।
            </p>

            {/* Form Controls */}
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">ব্যবহারকারীর নাম (Speaker Name)</label>
                <input
                  type="text"
                  value={enrolledUserName}
                  onChange={(e) => setEnrolledUserName(e.target.value)}
                  placeholder="আপনার নাম লিখুন..."
                  className="w-full px-3 py-2 bg-stone-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500/50 transition-all font-bold"
                />
              </div>

              {/* Read phrase instruction */}
              <div className="p-3 bg-stone-900/60 border border-white/5 rounded-xl space-y-1.5">
                <span className="text-[9px] font-bold text-pink-400 uppercase tracking-widest block">পড়ুন (Verification Phrase):</span>
                <p className="text-xs text-stone-300 font-medium italic select-text">
                  "হ্যালো জোয়া, আমাদের এই এআই প্রযুক্তিকে ভয়েস ভেরিফিকেশন দিয়ে সুরক্ষিত করো।"
                </p>
              </div>

              {/* Enrollment Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={startVoiceEnrollmentProcess}
                  disabled={voiceEnrollState === "recording"}
                  className={`flex-1 h-9 rounded-xl text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    voiceEnrollState === "recording"
                      ? "bg-pink-600/35 text-white cursor-wait"
                      : "bg-pink-500 text-stone-950 hover:bg-pink-400"
                  }`}
                >
                  {voiceEnrollState === "recording" ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      রেকর্ডিং হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5" />
                      ভয়েস রেকর্ড করুন (Enroll Signature)
                    </>
                  )}
                </button>
                
                {voiceMatchSaved && (
                  <button
                    onClick={() => {
                      localStorage.removeItem("zoya_voice_user_name");
                      localStorage.removeItem("zoya_voice_match_saved");
                      localStorage.removeItem("zoya_voice_signature");
                      setVoiceMatchSaved(false);
                      setVoiceSignature("");
                      setVoiceEnrollState("idle");
                    }}
                    className="h-9 px-3 rounded-xl border border-white/5 hover:border-rose-500/20 bg-stone-900 hover:bg-rose-950/10 text-gray-400 hover:text-rose-400 transition-all text-[10px] font-bold uppercase cursor-pointer"
                    title="Reset Voice Signature"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Progress Animation for Enrollment */}
              {voiceEnrollState === "recording" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono font-bold text-gray-400">
                    <span>সাউন্ড সিগন্যাল বিশ্লেষণ...</span>
                    <span className="animate-pulse">Pitch Analyser Active</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-400"
                    />
                  </div>
                </div>
              )}

              {/* Matches indicator */}
              {voiceMatchSaved && (
                <div className="p-3 bg-stone-900/40 border border-emerald-500/10 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-bold text-emerald-400 uppercase">ভয়েস যাচাইকরণ পরীক্ষা</span>
                    </div>
                    <span className="font-mono text-[9px] text-gray-500">ID: {voiceSignature.substring(0, 10)}...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">রিয়েল-টাইম ম্যাচ রেট:</span>
                    <span className="font-mono text-xs font-bold text-emerald-450">{connected && (status === "listening" || status === "speaking") ? `${liveMatchRate}%` : "১০০% (নিরাপদ)"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${connected && (status === "listening" || status === "speaking") ? liveMatchRate : 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Security Actions & Controls */}
          <div className="p-4 bg-stone-950/80 border border-white/5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-pink-400" />
              <h4 className="text-xs font-black text-gray-100 uppercase tracking-wider">ভয়েস লক ও কার্যকারিতা অপ্টিমাইজেশন</h4>
            </div>

            <div className="space-y-4 text-xs">
              {/* Toggle Voice Lock */}
              <div className="flex items-center justify-between p-2 hover:bg-stone-900/30 rounded-xl transition-all">
                <div>
                  <p className="font-bold text-gray-200">ভয়েস-লক সক্রিয় করুন (Enable Voice Lock)</p>
                  <p className="text-[10px] text-gray-500 font-medium">নিবন্ধিত কণ্ঠ ছাড়া অন্য কারও কমান্ড ব্লক করুন।</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceLockEnabled}
                    onChange={(e) => {
                      setVoiceLockEnabled(e.target.checked);
                      localStorage.setItem("zoya_voice_lock_enabled", String(e.target.checked));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500 pointer-events-auto" />
                </label>
              </div>

              {/* Security Threshold Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-gray-300">ভয়েস ম্যাচ সেন্সিটিভিটি (Security Threshold)</span>
                  <span className="font-mono text-pink-400 font-bold">{securityThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={securityThreshold}
                  onChange={(e) => {
                    setSecurityThreshold(Number(e.target.value));
                    localStorage.setItem("zoya_security_threshold", e.target.value);
                  }}
                  className="w-full accent-pink-500 bg-stone-900 h-1.5 rounded-lg cursor-pointer"
                />
                <p className="text-[9px] text-gray-500">উচ্চ থ্রেশহোল্ডে আরও নিখুঁত কণ্ঠ পরীক্ষা প্রয়োজন। রিকমেন্ডেড: ৮৫%।</p>
              </div>

              {/* Zoya Emotional Shifting test panel */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <div className="flex justify-between text-[11px] items-center mb-1">
                  <span className="font-bold text-gray-300">ইমোশন ডিটেকশন সিমুলেশন ওভাররাইড (Mood Override Test)</span>
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono">
                    {detectedMood === "happy" ? "😊 Happy" :
                     detectedMood === "melancholy" ? "😢 Melancholy" :
                     detectedMood === "excited" ? "🔥 Excited" :
                     detectedMood === "calm" ? "🧘 Calm" :
                     detectedMood === "thinking" ? "💭 Reflective" : "✨ Neutral"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 px-1">
                  {[
                    { id: "neutral", label: "স্বাভাবিক", icon: "✨" },
                    { id: "happy", label: "আনন্দিত", icon: "😊" },
                    { id: "melancholy", label: "বিষণ্ণ", icon: "😢" },
                    { id: "excited", label: "উত্তেজিত", icon: "🔥" },
                    { id: "calm", label: "শান্ত", icon: "🧘" },
                    { id: "thinking", label: "চিন্তাশীল", icon: "💭" },
                  ].map((moodItem) => (
                    <button
                      key={moodItem.id}
                      onClick={() => {
                        setDetectedMood(moodItem.id as any);
                        if (moodItem.id === "happy") setSubtitles("বাহ! আমার মন আজ অনেক খুশি ও আনন্দিত! বলুন কী সাহায্য করতে পারি?");
                        else if (moodItem.id === "melancholy") setSubtitles("মনের গভীরে কিছুটা বিষণ্ণতা বোধ করছি... সব ঠিক হয়ে যাবে আশা করি।");
                        else if (moodItem.id === "excited") setSubtitles("কি দারুন ব্যাপার! অসম্ভব চমৎকার একটা খবর! চলুন আজ নতুন কিছু শিখি!");
                        else if (moodItem.id === "calm") setSubtitles("আমার চারপাশ এখন অনেক শান্ত ও নির্মল... ধীরেসুস্থে কাজ করা যাক।");
                        else if (moodItem.id === "thinking") setSubtitles("বিষয়টি খুবই কৌতুহলজনক, আমি এই ডেটা এবং তথ্যগুলো গভীর মনোযোগ দিয়ে বিশ্লেষণ করছি...");
                        else setSubtitles("জোয়া আপনার কথা শোনার জন্য তৈরি... কথা বলুন!");
                      }}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        detectedMood === moodItem.id
                          ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                          : "bg-stone-900 border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                      }`}
                    >
                      <span className="text-sm">{moodItem.icon}</span>
                      <span>{moodItem.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-500">টেস্ট বাটনগুলোর সাহায্যে জোয়ার ভিন্ন ভিন্ন মেজাজের ভিজ্যুয়াল অর্ভ কালার স্যুইচিং পরীক্ষা করতে পারেন।</p>
              </div>

            </div>
          </div>

          {/* Section C: Diagnostic Details */}
          <div className="p-4 bg-stone-950/80 border border-white/5 rounded-2xl text-[11px] space-y-2.5">
            <p className="font-bold text-gray-200 uppercase tracking-widest text-[10px] block">সিস্টেম ইন্টিগ্রেশন ডায়াগনস্টিকস (Diagnostics)</p>
            <div className="grid grid-cols-2 gap-2 text-stone-400 font-mono text-[10px]">
              <div className="p-2 bg-stone-900 border border-white/5 rounded-xl space-y-1">
                <span className="text-gray-500 block">কন্টাক্ট স্পিকার পোর্টাল</span>
                <span className="text-white font-bold">16,000Hz Mono</span>
              </div>
              <div className="p-2 bg-stone-900 border border-white/5 rounded-xl space-y-1">
                <span className="text-gray-500 block">জোয়া অডিও স্পিড</span>
                <span className="text-white font-bold">{zoyaSpeechSpeed}x Normal</span>
              </div>
              <div className="p-2 bg-stone-900 border border-white/5 rounded-xl space-y-1">
                <span className="text-gray-500 block">ইমোশন সেনসিটিভিটি</span>
                <span className="text-white font-bold">{emotionSensitivity}%</span>
              </div>
              <div className="p-2 bg-stone-900 border border-white/5 rounded-xl space-y-1">
                <span className="text-gray-500 block">সিকিউর সকেট রিলে</span>
                <span className="text-white font-bold">{connected ? "ACTIVE (WSS)" : "INACTIVE"}</span>
              </div>
            </div>
          </div>

        </div>
    </div>
  );
}
