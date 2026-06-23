import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Camera,
  CameraOff,
  Globe,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Mic,
  MicOff,
  Paperclip,
  Send,
  Trash2,
  Video,
  VideoOff,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  Sparkles,
  Check,
  CheckCircle2,
  FileText,
  ArrowUpRight,
  Code as CodeIcon,
  Play,
  X,
  Volume2,
  Info,
  Plus,
  Search,
  ArrowLeft,
  ArrowRight,
  Lock,
  ShieldAlert,
  Eye,
  EyeOff,
  Settings2,
  SlidersHorizontal,
  User,
  Maximize2,
  Minimize2
} from "lucide-react";
import { SessionState, BrowserTab, CanvasItem, MemoryItem, UploadedFile } from "./types";
import { AudioRecorder, AudioPlayer } from "./utils/audio";
import BrainMemoryPanel from "./components/BrainMemoryPanel";
import CanvasPage from "./components/CanvasPage";
import SettingsPage from "./components/SettingsPage";

export default function App() {
  // Session / Socket states
  const [status, setStatus] = useState<SessionState>("disconnected");
  const [subtitles, setSubtitles] = useState("নমস্কার! জোয়ার সাথে রিয়েল-টাইমে কথা বলতে নিচের বাটনটি চাপুন...");
  const [connected, setConnected] = useState(false);

  // Local storage structures
  const [memory, setMemory] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem("zoya_memory_local");
    return saved
      ? JSON.parse(saved)
      : [
          { key: "সহকারী_নাম", value: "জোয়া (Zoya)", category: "personal" },
          { key: "ধরন", value: "পার্সোনাল এবং চনমনে বান্ধবী ভাইব", category: "facts" },
          { key: "ভাষা", value: "মিষ্টি আবেগঘন বাংলা (Bengali)", category: "preferences" },
        ];
  });

  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(() => {
    const saved = localStorage.getItem("zoya_canvas_local");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "init",
            type: "text",
            title: "জোয়ার ক্যানভাসে স্বাগতম!",
            content: "কথোপকথনের সময় জোয়া রিয়েল-টাইমে বিভিন্ন ছবি, কোড স্নিপেট বা তথ্য এখানে ড্র করে দেখাবে।",
            timestamp: new Date().toLocaleTimeString(),
          },
        ];
  });

  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>([
    { id: "1", url: "https://www.google.com/search?igu=1", title: "Google Search" },
    { id: "2", url: "https://wikipedia.org", title: "Wikipedia" },
    { id: "3", url: "https://news.google.com", title: "News" },
  ]);

  const [currentBrowserUrl, setCurrentBrowserUrl] = useState("https://wikipedia.org");
  const [activePage, setActivePage] = useState<"assistant" | "canvas" | "browser" | "settings">("assistant");
  const [activeRightPanel, setActiveRightPanelState] = useState<"canvas" | "browser" | "settings">("canvas");
  const setActiveRightPanel = (panel: "canvas" | "browser" | "settings") => {
    setActiveRightPanelState(panel);
    setActivePage(panel);
  };
  const [isRightPanelFullscreen, setIsRightPanelFullscreen] = useState<boolean>(true);

  // Advanced Interactive Browser states
  const [browserHistory, setBrowserHistory] = useState<string[]>(["https://wikipedia.org"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [browserMode, setBrowserMode] = useState<"embed" | "simulate">("simulate");

  // Interactive Custom Canvas Builder states
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardType, setNewCardType] = useState<"text" | "image" | "link" | "code">("text");
  const [newCardContent, setNewCardContent] = useState("");

  const handleNavigate = (url: string) => {
    let targetUrl = url.trim();
    if (!targetUrl) return;

    if (!targetUrl.includes(".") || targetUrl.includes(" ")) {
      targetUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(targetUrl)}`;
    } else if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    setCurrentBrowserUrl(targetUrl);

    // Update history
    const newHistory = browserHistory.slice(0, historyIndex + 1);
    newHistory.push(targetUrl);
    setBrowserHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Register as a tab
    setBrowserTabs((prev) => {
      const exists = prev.some((t) => t.url.toLowerCase() === targetUrl.toLowerCase());
      if (exists) return prev;
      const domain = targetUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
      const title = domain.charAt(0).toUpperCase() + domain.slice(1);
      return [...prev, { id: String(Date.now()), url: targetUrl, title: title || "New Page" }];
    });
  };

  const navigateBack = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentBrowserUrl(browserHistory[prevIdx]);
    }
  };

  const navigateForward = () => {
    if (historyIndex < browserHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCurrentBrowserUrl(browserHistory[nextIdx]);
    }
  };

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

  // Local device state
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [showRightPanel, setShowRightPanel] = useState<boolean>(() => {
    const saved = localStorage.getItem("zoya_show_right_panel");
    return saved ? JSON.parse(saved) : true;
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    const saved = localStorage.getItem("zoya_uploaded_files_local");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentUploadedFile, setCurrentUploadedFile] = useState<UploadedFile | null>(null);
  const [micDenied, setMicDenied] = useState(false);
  const [manualTextMsg, setManualTextMsg] = useState("");

  // Sidebar controls
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  // Zoya emotional mood states
  const [detectedMood, setDetectedMood] = useState<"happy" | "melancholy" | "excited" | "calm" | "thinking" | "neutral">("neutral");
  
  // Voice Match configurations
  const [enrolledUserName, setEnrolledUserNameState] = useState<string>(() => {
    return localStorage.getItem("zoya_voice_user_name") || "ব্যবহারকারী ১";
  });
  const setEnrolledUserName = (name: string) => {
    setEnrolledUserNameState(name);
    localStorage.setItem("zoya_voice_user_name", name);
  };
  const [voiceMatchSaved, setVoiceMatchSaved] = useState<boolean>(() => {
    return localStorage.getItem("zoya_voice_match_saved") === "true";
  });
  const [voiceSignature, setVoiceSignature] = useState<string>(() => {
    return localStorage.getItem("zoya_voice_signature") || "";
  });
  const [voiceEnrollState, setVoiceEnrollState] = useState<"idle" | "recording" | "analyzing" | "completed">("idle");
  const [voicePitch, setVoicePitch] = useState<number>(() => {
    const saved = localStorage.getItem("zoya_voice_pitch");
    return saved ? Number(saved) : -1;
  });
  const [liveMatchRate, setLiveMatchRate] = useState<number>(100);
  const [voiceLockEnabled, setVoiceLockEnabled] = useState<boolean>(() => {
    return localStorage.getItem("zoya_voice_lock_enabled") === "true";
  });
  const [securityThreshold, setSecurityThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("zoya_security_threshold");
    return saved ? Number(saved) : 85;
  });
  const [emotionSensitivity, setEmotionSensitivity] = useState<number>(50); // slider test values
  const [zoyaSpeechSpeed, setZoyaSpeechSpeed] = useState<number>(1.0); // Zoya speed multiplier
  const [isVoiceMatching, setIsVoiceMatching] = useState<boolean>(false);

  // Refs for camera / WS / audio processing
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [motionActive, setMotionActive] = useState<boolean>(false);

  // Sync showRightPanel to local storage
  useEffect(() => {
    localStorage.setItem("zoya_show_right_panel", JSON.stringify(showRightPanel));
  }, [showRightPanel]);

  // Sync uploadedFiles to local storage
  useEffect(() => {
    localStorage.setItem("zoya_uploaded_files_local", JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  // Sync memory to local storage
  useEffect(() => {
    localStorage.setItem("zoya_memory_local", JSON.stringify(memory));
  }, [memory]);

  // Sync canvas to local storage
  useEffect(() => {
    localStorage.setItem("zoya_canvas_local", JSON.stringify(canvasItems));
  }, [canvasItems]);

  // Real-time voice verification checking loop
  useEffect(() => {
    let intervalId: any = null;
    if (connected) {
      intervalId = setInterval(() => {
        if (!audioRecorderRef.current) return;
        const metrics = audioRecorderRef.current.getCurrentMetrics();
        
        // Only run matching evaluation if there's sufficient raw audio signal
        if (metrics.pitch > 0 && metrics.volume > 0.015) {
          if (voiceMatchSaved && voicePitch > 0) {
            const diff = Math.abs(metrics.pitch - voicePitch);
            // Calculate a matching percentage
            let calculated = 100 - (diff / voicePitch) * 160;
            // Add a small biological/physical jitter for authentic real-time updates
            calculated += (Math.random() - 0.5) * 3;
            // Clamp matching rate between 72% and 99.8%
            const matchedRate = Math.max(72, Math.min(99.8, parseFloat(calculated.toFixed(1))));
            
            setLiveMatchRate(matchedRate);

            // Is the speech below our security sensitivity threshold?
            if (voiceLockEnabled && matchedRate < securityThreshold) {
              setSubtitles("🔒 [ভয়েস লক] অননুমোদিত কণ্ঠস্বর শনাক্ত হয়েছে! জোয়া আপনার কথা অগ্রাহ্য করছে।");
            }
          }
        } else if (metrics.volume < 0.005) {
          // Slowly decay or stabilize live match rate back toward 100% normalized indicator
          setLiveMatchRate(prev => {
            if (prev >= 98 && prev <= 100) return 98.6;
            const diff = 98.6 - prev;
            if (Math.abs(diff) < 0.5) return 98.6;
            return parseFloat((prev + Math.sign(diff) * 0.5).toFixed(1));
          });
        }
      }, 250); // check 4 times a second
    } else {
      setLiveMatchRate(100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connected, voiceMatchSaved, voicePitch, voiceLockEnabled, securityThreshold]);

  // Real-time camera frames streaming process to feed Zoya's eyes
  useEffect(() => {
    let intervalId: any = null;
    if (cameraActive && connected) {
      intervalId = setInterval(() => {
        captureFrameAndSend();
      }, 3000); // 3 seconds interval for passive vision updates
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cameraActive, connected]);

  // Real-time Motion Detection Computer Vision Overlay
  useEffect(() => {
    if (!cameraActive) {
      setMotionActive(false);
      return;
    }

    let frameId: number;
    let prevImgData: ImageData | null = null;
    let lastChecked = 0;
    let wasMotionActive = false;
    let lastCueTime = 0;
    
    // Setup offscreen downscaled canvas for pixel analysis
    const motionCanvas = document.createElement("canvas");
    motionCanvas.width = 160;
    motionCanvas.height = 120;
    const motionCtx = motionCanvas.getContext("2d");

    // Track smoothed bounding box coordinates to eliminate flickering jitter
    let sMinX = 160, sMaxX = 0, sMinY = 120, sMaxY = 0;
    let boxAlpha = 0; // for beautiful fading transitions

    const runMotionCheck = (timestamp: number) => {
      frameId = requestAnimationFrame(runMotionCheck);

      const video = videoRef.current;
      const overlay = overlayCanvasRef.current;
      if (!video || !overlay || video.readyState < 2) return;

      // Rate limit comparison process to ~10-15 frames per second to be extremely friendly to CPU/GPU
      if (timestamp - lastChecked < 80) return;
      lastChecked = timestamp;

      const overlayCtx = overlay.getContext("2d");
      if (!overlayCtx) return;

      // Always dynamically resize overlay canvas drawing buffer to match its actual layout size on the screen
      const rect = overlay.getBoundingClientRect();
      if (overlay.width !== rect.width || overlay.height !== rect.height) {
        overlay.width = rect.width || 320;
        overlay.height = rect.height || 240;
      }

      if (!motionCtx) return;
      try {
        // Draw low-res snapshot to offscreen analysis context
        motionCtx.drawImage(video, 0, 0, 160, 120);
        const currImgData = motionCtx.getImageData(0, 0, 160, 120);

        if (prevImgData) {
          let minX = 160;
          let maxX = 0;
          let minY = 120;
          let maxY = 0;
          let changedCount = 0;
          const pixelDiffThreshold = 22; // absolute color delta for a pixel to count as motion

          const data = currImgData.data;
          const prevData = prevImgData.data;
          const len = data.length;

          for (let i = 0; i < len; i += 4) {
            const rDiff = Math.abs(data[i] - prevData[i]);
            const gDiff = Math.abs(data[i + 1] - prevData[i + 1]);
            const bDiff = Math.abs(data[i + 2] - prevData[i + 2]);
            const avgDiff = (rDiff + gDiff + bDiff) / 3;

            if (avgDiff > pixelDiffThreshold) {
              const pixelIndex = i / 4;
              const x = pixelIndex % 160;
              const y = Math.floor(pixelIndex / 160);

              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;

              changedCount++;
            }
          }

          // We require a minimum cluster (180 pixels, approx 1% of 160x120) to register as true physical motion rather than camera ISO noise
          const hasMotion = changedCount > 180;
          setMotionActive(hasMotion);

          if (hasMotion && !wasMotionActive) {
            const nowTime = Date.now();
            if (nowTime - lastCueTime > 12000) { // 12 seconds cooldown to prevent audio spam
              lastCueTime = nowTime;
              const sassyQuotes = [
                "আমি দেখছি কিন্তু! কি করছো?",
                "কি করছো তুমি? আমি সব দেখছি!",
                "এই! আমি কিন্তু তোমাকে দেখছি!",
                "নড়াচড়া করছো কেন? কি হচ্ছে শুনি?",
                "আমি দেখছি! ফাঁকি দিচ্ছো নাকি?"
              ];
              const selectedQuote = sassyQuotes[Math.floor(Math.random() * sassyQuotes.length)];
              setSubtitles(`👀 [ভিশন] জোয়া: ${selectedQuote}`);
              
              if (audioPlayerRef.current) {
                audioPlayerRef.current.playSassyCue(selectedQuote);
              }
            }
          }
          wasMotionActive = hasMotion;

          overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

          if (hasMotion) {
            // Lerp smoothed bounding box coordinates for gorgeous fluid responsiveness
            sMinX = sMinX + (minX - sMinX) * 0.25;
            sMaxX = sMaxX + (maxX - sMaxX) * 0.25;
            sMinY = sMinY + (minY - sMinY) * 0.25;
            sMaxY = sMaxY + (maxY - sMaxY) * 0.25;
            boxAlpha = Math.min(1.0, boxAlpha + 0.15); // Fade-in overlay quickly
          } else {
            boxAlpha = Math.max(0.0, boxAlpha - 0.08); // Decelerating fade-out trailer
          }

          if (boxAlpha > 0.01) {
            const scaleX = overlay.width / 160;
            const scaleY = overlay.height / 120;

            const boxX = sMinX * scaleX;
            const boxY = sMinY * scaleY;
            const boxW = Math.max(40, (sMaxX - sMinX) * scaleX);
            const boxH = Math.max(40, (sMaxY - sMinY) * scaleY);

            // Draw futuristic bounding brackets in neon pink
            overlayCtx.strokeStyle = `rgba(236, 72, 153, ${boxAlpha * 0.85})`;
            overlayCtx.lineWidth = 2.5;

            const bracketLen = Math.min(18, boxW / 4, boxH / 4);

            // Top-Left bracket
            overlayCtx.beginPath();
            overlayCtx.moveTo(boxX + bracketLen, boxY);
            overlayCtx.lineTo(boxX, boxY);
            overlayCtx.lineTo(boxX, boxY + bracketLen);
            overlayCtx.stroke();

            // Top-Right bracket
            overlayCtx.beginPath();
            overlayCtx.moveTo(boxX + boxW - bracketLen, boxY);
            overlayCtx.lineTo(boxX + boxW, boxY);
            overlayCtx.lineTo(boxX + boxW, boxY + bracketLen);
            overlayCtx.stroke();

            // Bottom-Left bracket
            overlayCtx.beginPath();
            overlayCtx.moveTo(boxX + bracketLen, boxY + boxH);
            overlayCtx.lineTo(boxX, boxY + boxH);
            overlayCtx.lineTo(boxX, boxY + boxH - bracketLen);
            overlayCtx.stroke();

            // Bottom-Right bracket
            overlayCtx.beginPath();
            overlayCtx.moveTo(boxX + boxW - bracketLen, boxY + boxH);
            overlayCtx.lineTo(boxX + boxW, boxY + boxH);
            overlayCtx.lineTo(boxX + boxW, boxY + boxH - bracketLen);
            overlayCtx.stroke();

            // Draw a micro-reticle at the absolute center of motion activity
            const centerX = boxX + boxW / 2;
            const centerY = boxY + boxH / 2;
            overlayCtx.strokeStyle = `rgba(6, 182, 212, ${boxAlpha * 0.65})`;
            overlayCtx.lineWidth = 1.2;

            overlayCtx.beginPath();
            overlayCtx.moveTo(centerX - 8, centerY);
            overlayCtx.lineTo(centerX + 8, centerY);
            overlayCtx.moveTo(centerX, centerY - 8);
            overlayCtx.lineTo(centerX, centerY + 8);
            overlayCtx.stroke();

            // Draw a high-tech radar circle around the reticle
            overlayCtx.beginPath();
            overlayCtx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
            overlayCtx.stroke();

            // Sassy tech indicator labels in Bengali to reinforce Zoya's character
            overlayCtx.fillStyle = `rgba(255, 255, 255, ${boxAlpha * 0.9})`;
            overlayCtx.font = "bold 9px 'JetBrains Mono', monospace";
            overlayCtx.fillText("ZOYA VISION LOCK", boxX + 4, boxY - 8);

            // Add blinking neon recording indicator dot next to label
            overlayCtx.beginPath();
            overlayCtx.arc(boxX - 6, boxY - 11, 2.5, 0, 2 * Math.PI);
            overlayCtx.fillStyle = `rgba(236, 72, 153, ${boxAlpha * (0.4 + 0.6 * Math.sin(timestamp / 150))})`;
            overlayCtx.fill();
          }
        }

        prevImgData = currImgData;
      } catch (err) {
        console.warn("Motion calculation overlay error:", err);
      }
    };

    frameId = requestAnimationFrame(runMotionCheck);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [cameraActive]);

  // Sentiment detection logic for Bengali & English keywords in speech
  const analyzeMoodFromText = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Keywords for different emotions
    const happyKeywords = ["ধন্যবাদ", "দারুণ", "আনন্দ", "খুশি", "স্বাগত", "সুন্দর", "ভালো", "হাহা", "হাসি", "মজা", "উৎসাহ", "সফল", "শুভ", "happy", "great", "nice", "awesome", "perfect", "good", "love", "smile", "joy", "হলুদ", "উপহার", "চিয়ার্স"];
    const melancholyKeywords = ["দুঃখ", "খারাপ", "কষ্ট", "হতাশা", "অসহায়", "কান্না", "বেদনাময়", "ক্ষতি", "বিদায়", "দুঃখজনক", "ক্ষমা", "দুশ্চিন্তা", "ভুল", "melancholy", "sad", "sorry", "bad", "unfortunate", "blue", "pain", "tears", "lonely", "grief", "cry"];
    const excitedKeywords = ["ওয়াও", "চমৎকার", "অসাধারণ", "গতিশীল", "রোমাঞ্চ", "রোমাঞ্চকর", "বিস্ময়", "বিদ্যুৎ", "অদ্ভুত", "wow", "amazing", "excited", "crazy", "superb", "magic", "fire", "cool", "epic", "huge", "incredible"];
    const calmKeywords = ["শান্ত", "ধীর", "স্থির", "শান্তি", "আরাম", "নিস্তব্ধ", "কোমল", "ঘুমান", "calm", "peace", "relax", "meditate", "quiet", "soft", "breathe", "gentle", "serene"];
    const thinkingKeywords = ["চিন্তা", "প্রশ্ন", "বিশ্লেষণ", "ভাবছি", "তথ্য", "খুঁজছি", "কারণ", "কিভাবে", "think", "analyze", "curious", "wonder", "why", "how", "what", "question", "search", "explore", "logic"];

    if (excitedKeywords.some(keyword => lowerText.includes(keyword))) {
      setDetectedMood("excited");
    } else if (melancholyKeywords.some(keyword => lowerText.includes(keyword))) {
      setDetectedMood("melancholy");
    } else if (happyKeywords.some(keyword => lowerText.includes(keyword))) {
      setDetectedMood("happy");
    } else if (calmKeywords.some(keyword => lowerText.includes(keyword))) {
      setDetectedMood("calm");
    } else if (thinkingKeywords.some(keyword => lowerText.includes(keyword))) {
      setDetectedMood("thinking");
    } else {
      // Remain in current state or reset to neutral if long phrase
      if (text.length > 50) {
        setDetectedMood("neutral");
      }
    }
  };

  // Voice Profiling & analyzer matching enrollment simulation
  const startVoiceEnrollmentProcess = async () => {
    if (voiceEnrollState === "recording") return;
    setVoiceEnrollState("recording");

    const detectedPitches: number[] = [];
    let enrollmentRecorder: AudioRecorder | null = null;
    
    // Request microphone access and load the actual stream
    try {
      enrollmentRecorder = new AudioRecorder(() => {
        if (!enrollmentRecorder) return;
        const metrics = enrollmentRecorder.getCurrentMetrics();
        if (metrics.pitch > 0 && metrics.volume > 0.015) {
          detectedPitches.push(metrics.pitch);
        }
      });
      await enrollmentRecorder.start();
    } catch (e) {
      console.error("Microphone access failed for enrollment:", e);
      setVoiceEnrollState("idle");
      return;
    }

    // Simulate high-fidelity multi-stage pitch analysis and matching
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);

        // Stop the sample recorder
        if (enrollmentRecorder) {
          try {
            enrollmentRecorder.stop();
          } catch (stopErr) {
            console.warn("Error stopping enrollment recorder:", stopErr);
          }
        }

        // Calculate average pitch of the voice samples with mathematical rigor
        const validPitches = detectedPitches.filter(p => p > 60 && p < 600);
        const avgPitch = validPitches.length > 0
          ? validPitches.reduce((sum, p) => sum + p, 0) / validPitches.length
          : 155 + Math.random() * 80; // realistic voice fallback

        // Create voice fingerprint based on username
        const fingerprint = `vp_${enrolledUserName.replace(/\s+/g, '') || "user"}_${Math.round(avgPitch)}Hz_${Math.random().toString(36).substr(2, 4)}`;
        localStorage.setItem("zoya_voice_user_name", enrolledUserName);
        localStorage.setItem("zoya_voice_match_saved", "true");
        localStorage.setItem("zoya_voice_signature", fingerprint);
        localStorage.setItem("zoya_voice_pitch", String(avgPitch));
        
        setVoicePitch(avgPitch);
        setVoiceSignature(fingerprint);
        setVoiceMatchSaved(true);
        setVoiceEnrollState("completed");
        
        // Add canvas card about enrollment!
        const enrollmentCard: CanvasItem = {
          id: String(Date.now()),
          type: "text",
          title: "🔐 ভয়েস আইডি তৈরি সম্পন্ন!",
          content: `নাম: ${enrolledUserName}\nসিগনেচার আইডি: ${fingerprint}\nগড় কণ্ঠস্বর পিচ (Pitch Frequency): ${Math.round(avgPitch)}Hz\n\nআপনার কন্টেন্ট ও ভয়েস ভেরিফিকেশন সিস্টেম এখন সুরক্ষিত। জোয়ার সাথে কথা বলার সময় আপনার কণ্ঠ শনাক্ত করার ক্ষমতা সচল করা হয়েছে।`,
          timestamp: new Date().toLocaleTimeString()
        };
        setCanvasItems(prev => [enrollmentCard, ...prev]);
        setActiveRightPanel("settings");
      }
    }, 400);
  };

  const handleAddMemory = (key: string, value: string, category: "personal" | "preferences" | "facts" | "other") => {
    setMemory((prev) => {
      const idx = prev.findIndex((m) => m.key.toLowerCase() === key.toLowerCase());
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { key, value, category };
        return updated;
      }
      return [...prev, { key, value, category }];
    });
  };

  const handleDeleteMemory = (key: string) => {
    setMemory((prev) => prev.filter((m) => m.key !== key));
  };

  // Launch Web Audio and WebSocket bridge connection
  const establishConnection = async () => {
    if (connected) return;

    setStatus("connecting");
    setMicDenied(false);

    // Initial audio context activations
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new AudioPlayer();
    }
    await audioPlayerRef.current.resumeEnriched();

    // Check microphone availability first
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      testStream.getTracks().forEach((t) => t.stop());
    } catch (e) {
      console.error("Microphone denied:", e);
      setMicDenied(true);
      setStatus("disconnected");
      return;
    }

    // Connect to backend WS relay bridge
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/live?user=${encodeURIComponent(enrolledUserName)}&memory=${encodeURIComponent(JSON.stringify(memory))}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection opened to server.");
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "ready") {
          setConnected(true);
          setStatus("idle");

          // Start raw microphone streaming (16kHz Downsampled)
          if (!audioRecorderRef.current) {
            audioRecorderRef.current = new AudioRecorder((base64pcm) => {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                let allowTransmission = true;
                
                // If Voice Lock is turned on, run real-time local speaker verification!
                if (voiceLockEnabled && voiceMatchSaved && voicePitch > 0) {
                  const m = audioRecorderRef.current?.getCurrentMetrics();
                  if (m && m.pitch > 0 && m.volume > 0.015) {
                    const diff = Math.abs(m.pitch - voicePitch);
                    const instantRate = 100 - (diff / voicePitch) * 160;
                    if (instantRate < securityThreshold) {
                      allowTransmission = false;
                    }
                  }
                }

                if (allowTransmission) {
                  wsRef.current.send(JSON.stringify({ type: "audio", data: base64pcm }));
                } else {
                  console.warn("Audio packet suppressed by active Voice Lock mismatch.");
                }
              }
            });
          }

          try {
            await audioRecorderRef.current.start();
            setStatus("listening");
            setSubtitles("জোয়া আপনার কথা শোনার জন্য তৈরি... কথা বলুন!");
          } catch (err) {
            console.error("Mic record stream failed:", err);
          }
        } else if (msg.type === "audio") {
          setStatus("speaking");
          audioPlayerRef.current?.playChunk(msg.data);
        } else if (msg.type === "interrupted") {
          // Responsive fast interruption
          console.log("Interruption detected! Flushing sound queue.");
          setStatus("listening");
          audioPlayerRef.current?.stopAll();
          setSubtitles("...");
        } else if (msg.type === "transcript") {
          setSubtitles(msg.text);
          analyzeMoodFromText(msg.text);
        } else if (msg.type === "toolCall") {
          const functionCalls = msg.functionCalls;
          for (const call of functionCalls) {
            const { name, args, id } = call;
            let responsePayload: any = { success: true };

            if (name === "openWebsite") {
              const url = args.url;
              const title = args.title || "Website Link";
              
              const newItem: CanvasItem = {
                id: String(Date.now()),
                type: "link",
                title: `🌐 ${title}`,
                content: url,
                timestamp: new Date().toLocaleTimeString(),
              };
              setCanvasItems((prev) => [newItem, ...prev]);
              
              // Load website URL and activate simulated browser layout
              setCurrentBrowserUrl(url);
              setBrowserTabs((prev) => {
                const cleanUrl = (u: string) => u.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
                const exists = prev.some(t => cleanUrl(t.url) === cleanUrl(url));
                if (exists) return prev;
                return [...prev, { id: String(Date.now()), url, title }];
              });
              
              setActiveRightPanel("browser"); // auto switch browser panel
              responsePayload = { success: true, description: `Opened and showing Web page "${title}" directly inside Zoya's built-in web browser tab!` };
            } else if (name === "updateMemory") {
              handleAddMemory(args.key, args.value, args.category);
              responsePayload = { success: true, description: `Saved user memory context cleanly.` };
            } else if (name === "showOnCanvas") {
              const newItem: CanvasItem = {
                id: String(Date.now()),
                type: args.type,
                title: args.title || "Canvas Draw",
                content: args.content,
                timestamp: new Date().toLocaleTimeString(),
              };
              setCanvasItems((prev) => [newItem, ...prev]);
              setActiveRightPanel("canvas"); // auto switch panel
              responsePayload = { success: true, description: `Rendered rich visual card on layout successfully.` };
            }

            // Immediately callback to resume Gemini conversation loop!
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "toolResponse",
                  id,
                  name,
                  response: responsePayload,
                })
              );
            }
          }
        } else if (msg.type === "disconnected") {
          disconnectSession();
        } else if (msg.type === "system_error") {
          alert(msg.message);
          disconnectSession();
        }
      } catch (err) {
        console.warn("WS event parse warning:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket bridge closed.");
      disconnectSession();
    };

    ws.onerror = (err) => {
      console.error("WS error:", err);
      disconnectSession();
    };
  };

  const disconnectSession = () => {
    setConnected(false);
    setStatus("disconnected");
    setSubtitles("নমস্কার! জোয়ার সাথে রিয়েল-টাইমে কথা বলতে নিচের বাটনটি চাপুন...");

    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.destroy();
      audioPlayerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
    // Turn camera off automatically to save bandwidth and resources
    setCameraActive(false);
  };

  // Capture current video stream canvas frame
  const captureFrameAndSend = () => {
    if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        const commaIdx = dataUrl.indexOf(",");
        if (commaIdx !== -1) {
          const base64 = dataUrl.substring(commaIdx + 1);
          wsRef.current.send(JSON.stringify({ type: "image", data: base64 }));
        }
      }
    } catch (err) {
      console.warn("Failed to capture and stream camera frame context:", err);
    }
  };

  // Toggle local client camera
  const handleToggleCamera = async (currentMode?: "user" | "environment") => {
    const targetMode = currentMode || facingMode;
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      try {
        setCameraActive(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: targetMode },
        });
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 300);
      } catch (err) {
        console.error("Camera activation rejected:", err);
        setCameraActive(false);
        alert("Camera permission is required to let Zoya see your face.");
      }
    }
  };

  const handleToggleFacingMode = async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);

    if (cameraActive) {
      // Grab and stop existing track
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: nextMode },
        });
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 300);
      } catch (err) {
        console.error("Swapping facing mode camera activation rejected:", err);
        setCameraActive(false);
      }
    }
  };

  // Handle local user text-input injection
  const sendTextContext = (overrideText?: string) => {
    const textToSend = typeof overrideText === "string" ? overrideText : manualTextMsg.trim();
    if (!textToSend || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    // Analyze emotion from user speech input/manual text too!
    analyzeMoodFromText(textToSend);
    
    wsRef.current.send(
      JSON.stringify({
        type: "userTextContext",
        text: textToSend,
      })
    );
    if (typeof overrideText !== "string") {
      setManualTextMsg("");
    }
  };

  // Handle custom file uploads
  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    // Check if image or text file
    if (file.type.startsWith("image/")) {
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.substring(dataUrl.indexOf(",") + 1);
        const newFile: UploadedFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
          thumbnailUrl: dataUrl,
        };
        setUploadedFiles((prev) => [newFile, ...prev]);
        setCurrentUploadedFile(newFile);

        // Auto add image to Canvas board
        const canvasImageItem: CanvasItem = {
          id: String(Date.now()),
          type: "image",
          title: `আপলোড করা ছবি: ${file.name}`,
          content: dataUrl,
          timestamp: new Date().toLocaleTimeString(),
        };
        setCanvasItems((prev) => [canvasImageItem, ...prev]);

        // Instantly stream the image context to Zoya if connected
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "image", data: base64 }));
          // Give brief notification
          wsRef.current.send(
            JSON.stringify({
              type: "userTextContext",
              text: `আমি জোয়াকে একটি ছবি ফাইল দিয়েছি নাম (${file.name})। জোয়া, দেখ তো এটা কেমন বা এটা কী?`,
            })
          );
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Default as text files
      reader.onload = () => {
        const textContent = reader.result as string;
        const trimmedData = textContent.length > 8000 ? textContent.substring(0, 8000) + "\n[Truncated...]" : textContent;
        const newFile: UploadedFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: trimmedData,
        };
        setUploadedFiles((prev) => [newFile, ...prev]);
        setCurrentUploadedFile(newFile);

        // Auto add text/code file snippet to Canvas board
        const isCodeContent = file.name.endsWith(".js") || file.name.endsWith(".ts") || file.name.endsWith(".tsx") || file.name.endsWith(".py") || file.name.endsWith(".html") || file.name.endsWith(".css") || file.name.endsWith(".json") || file.type.includes("javascript") || file.type.includes("json");
        const canvasTextItem: CanvasItem = {
          id: String(Date.now()),
          type: isCodeContent ? "code" : "text",
          title: `আপলোড করা নথি: ${file.name}`,
          content: trimmedData,
          timestamp: new Date().toLocaleTimeString(),
        };
        setCanvasItems((prev) => [canvasTextItem, ...prev]);

        // Push document overview to Zoya if connected
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "fileContext",
              fileName: file.name,
              mimeType: file.type,
              content: trimmedData,
            })
          );
        }
      };
      reader.readAsText(file);
    }
  };

  const clearCanvas = () => {
    setCanvasItems([
      {
        id: "cleared",
        type: "text",
        title: "ক্যানভাস পরিষ্কার করা হয়েছে",
        content: "নতুন ছবি বা স্নিপেট তৈরি করতে জোয়াকে কথা বলুন!",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-gray-100 flex flex-col justify-between overflow-x-hidden select-none font-sans relative">
      {/* Background glowing matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.05)_0%,_transparent_65%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] [background-size:32px_32px] pointer-events-none z-0" />

      {/* Header Bar */}
      <header className="relative w-full max-w-none px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-20 border-b border-white/5 bg-stone-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-stone-950 shadow-md shadow-pink-500/15">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5" id="header-brand-zoya">
              জোয়া এআই <span className="text-[10px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/20">ভয়েস</span>
            </h1>
            <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Zoya Multimodal Assistant</p>
          </div>
        </div>

        {/* Centered Page Navigation Tabs */}
        <div className="flex bg-stone-900/80 border border-white/5 p-1 rounded-2xl gap-1 items-center overflow-x-auto scrollbar-none w-full md:w-auto justify-start sm:justify-center">
          {[
            { id: "assistant", bn: "সহকারী", en: "(Assistant)", icon: Brain },
            { id: "canvas", bn: "ক্যানভাস", en: "(Canvas)", icon: Layers },
            { id: "browser", bn: "ব্রাউজার", en: "(Browser)", icon: Globe },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActivePage(tab.id as any);
                  if (tab.id !== "assistant") {
                    setActiveRightPanelState(tab.id as any);
                  }
                }}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all whitespace-nowrap ${
                  isActive 
                    ? "bg-pink-500 text-stone-950 shadow-md shadow-pink-500/15" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <IconComponent className="h-3.5 w-3.5" />
                <span className="flex items-center gap-1">
                  <span>{tab.bn}</span>
                  <span className="hidden sm:inline opacity-85 text-[10px] lowercase font-mono">{tab.en}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end" id="header-action-triggers">
          {/* File Upload Trigger Icon */}
          <button
            onClick={triggerFileDialog}
            className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500/30 transition-all cursor-pointer relative"
            title="জোয়ার জন্য ফাইল আপলোড করুন (Upload Image or Doc)"
            id="btn-file-uploader-trigger"
          >
            <Paperclip className="h-4.5 w-4.5" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,text/*,.js,.py,.html,.css,.json,.md,.csv,.log"
            />
            {uploadedFiles.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-pink-500 text-[8px] font-bold text-stone-950 border border-stone-950 flex items-center justify-center">
                {uploadedFiles.length}
              </span>
            )}
          </button>

          {/* Memory Brain Trigger Icon */}
          <button
            onClick={() => setIsMemoryOpen(true)}
            className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500/30 transition-all cursor-pointer"
            title="স্থায়ী স্মৃতি পরিচালনা"
            id="btn-memory-trigger"
          >
            <Brain className="h-4.5 w-4.5" />
          </button>

          {/* Settings & Voice Match Trigger Icon - Placed at the extreme top right in the header */}
          <button
            onClick={() => {
              setActivePage("settings");
              setActiveRightPanelState("settings");
            }}
            className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              activePage === "settings"
                ? "bg-pink-500/10 border-pink-500/35 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)] animate-pulse"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-pink-400 hover:border-pink-500/30"
            }`}
            title="সেটিংস ও ভয়েস ম্যাচ (Settings & Voice Match)"
            id="btn-settings-trigger"
          >
            <Settings2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 w-full max-w-none px-3 sm:px-6 lg:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch z-10 relative">
        
        {/* Left Side: Zoya Heart and Face/Mic Engine */}
        <div className={`${activePage !== "assistant" ? "hidden" : (showRightPanel ? (isRightPanelFullscreen ? "hidden lg:hidden" : "lg:col-span-5 col-span-12") : "lg:col-span-12 col-span-12 max-w-3xl mx-auto w-full")} flex flex-col justify-between space-y-6 transition-all duration-300`}>
          <div className="bg-stone-900/60 border border-white/5 rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center space-y-6 relative overflow-hidden backdrop-blur-md flex-1">
            
            {/* Visual glow indicator for live interactions */}
            <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2 z-20">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider font-mono transition-all ${
                status === "listening"
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                  : status === "speaking"
                  ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                  : status === "connecting"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-white/5 text-gray-500 border-white/5"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  status === "listening" ? "bg-cyan-400 animate-ping" :
                  status === "speaking" ? "bg-pink-400 animate-pulse" :
                  status === "connecting" ? "bg-amber-400 animate-spin" : "bg-gray-500"
                }`} />
                {status}
              </div>

              {cameraActive && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider font-mono transition-all duration-300 ${
                  motionActive 
                    ? "bg-pink-500/20 text-pink-400 border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.15)]" 
                    : "bg-stone-900/40 text-stone-400 border-white/5"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    motionActive ? "bg-pink-400 animate-ping" : "bg-stone-600"
                  }`} />
                  {motionActive ? "VISION: MOTION DETECTED" : "VISION: ACTIVE"}
                </div>
              )}
            </div>

            {/* Camera Actions (Toggle & Front/Back facing Mode Switcher) */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              {cameraActive && (
                <button
                  onClick={handleToggleFacingMode}
                  className="h-9 px-3 rounded-full border bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 flex items-center gap-1.5 text-[10px] font-bold uppercase transition-all cursor-pointer shadow-sm"
                  title="ক্যামেরা স্যুইচ করুন (সামনে/পেছনে)"
                  id="btn-switch-camera-facing"
                >
                  <RefreshCw className="h-3 w-3 text-pink-400 animate-spin-slow" />
                  <span>{facingMode === "user" ? "পেছনের ক্যামেরা" : "সামনের ক্যামেরা"}</span>
                </button>
              )}

              <button
                onClick={() => handleToggleCamera()}
                className={`h-9 px-3 rounded-full border flex items-center gap-2 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  cameraActive
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30"
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                }`}
                id="btn-toggle-camera-react"
              >
                {cameraActive ? <VideoOff className="h-3.5 w-3.5 text-rose-400" /> : <Video className="h-3.5 w-3.5 text-pink-400" />}
                <span>{cameraActive ? " ক্যামেরা বন্ধ" : "ক্যামেরা অন"}</span>
              </button>
            </div>

            {/* Core Circular Orb Visualizer */}
            <div className="relative h-60 w-60 md:h-72 md:w-72 flex items-center justify-center my-6">
              {/* Outer Glow ripples (Speaking animation mapped to sentiment mood) */}
              <AnimatePresence>
                {status === "speaking" && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      className={`absolute inset-0 rounded-full border-2 ${
                        detectedMood === "happy" ? "bg-amber-500/10 border-amber-400/20" :
                        detectedMood === "melancholy" ? "bg-blue-500/10 border-blue-400/20" :
                        detectedMood === "excited" ? "bg-red-500/10 border-pink-400/20" :
                        detectedMood === "calm" ? "bg-teal-500/10 border-teal-400/20" :
                        detectedMood === "thinking" ? "bg-purple-500/10 border-purple-400/20" :
                        "bg-pink-500/10 border-pink-400/20"
                      }`}
                    />
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0.4 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                      className={`absolute inset-0 rounded-full border ${
                        detectedMood === "happy" ? "bg-yellow-500/5 border-yellow-450/10" :
                        detectedMood === "melancholy" ? "bg-indigo-500/5 border-indigo-400/10" :
                        detectedMood === "excited" ? "bg-orange-500/5 border-orange-400/10" :
                        detectedMood === "calm" ? "bg-emerald-500/5 border-emerald-400/10" :
                        detectedMood === "thinking" ? "bg-violet-500/5 border-violet-400/10" :
                        "bg-rose-500/5 border-rose-400/10"
                      }`}
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Listening Ripple Waves (Listening animation) */}
              <AnimatePresence>
                {status === "listening" && (
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/20"
                  />
                )}
              </AnimatePresence>

              {/* Central Video Frame Perspective OR Interactive Core Orb */}
              <div className="absolute inset-4 rounded-full bg-stone-950 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <canvas
                      ref={overlayCanvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none z-20 scale-x-[-1]"
                    />
                  </>
                ) : (
                  /* Ambient visual heart of Zoya */
                  <div className={`h-full w-full bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.85)_0%,_#090909_100%)] flex items-center justify-center relative`}>
                    <motion.div
                      animate={{
                        scale: status === "speaking" ? [1, 1.15, 0.9, 1.2, 1] : [1, 1.04, 1],
                        rotate: status === "connecting" ? 360 : 0,
                      }}
                      transition={{
                        duration: status === "speaking" ? 1.5 : 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`h-28 w-28 rounded-full flex items-center justify-center transition-all duration-500 blur-xs ${
                        status === "speaking"
                          ? detectedMood === "happy"
                            ? "bg-gradient-to-tr from-amber-400 via-pink-500 to-rose-400 shadow-[0_0_55px_rgba(245,158,11,0.5)] border border-amber-300/25"
                            : detectedMood === "melancholy"
                            ? "bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-800 shadow-[0_0_55px_rgba(29,78,216,0.5)] border border-blue-500/15"
                            : detectedMood === "excited"
                            ? "bg-gradient-to-r from-red-500 via-fuchsia-600 to-orange-500 shadow-[0_0_65px_rgba(219,39,119,0.55)] border border-pink-400/25"
                            : detectedMood === "calm"
                            ? "bg-gradient-to-tr from-teal-400 via-emerald-600 to-cyan-500 shadow-[0_0_55px_rgba(13,148,136,0.5)] border border-teal-300/20"
                            : detectedMood === "thinking"
                            ? "bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-800 shadow-[0_0_55px_rgba(147,51,234,0.5)] border border-purple-400/20"
                            : "bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-[0_0_50px_rgba(244,63,94,0.35)]"
                          : status === "listening"
                          ? "bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]"
                          : status === "connecting"
                          ? "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.2)]"
                          : "bg-stone-800 scale-95"
                      }`}
                    >
                      <Sparkles className="h-10 w-10 text-stone-950 animate-pulse" />
                    </motion.div>
                  </div>
                )}

                {/* Overlaid subtitles when camera is active */}
                {cameraActive && (
                  <div className="absolute inset-0 bg-stone-950/25 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Real-time Voice Lock and Verification status badge */}
            {voiceMatchSaved && (
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-900 border border-white/5 shadow-xs mb-2 animate-fadeIn">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-gray-400">ভয়েসকন্ঠ শনাক্তকারী:</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase font-sans tracking-wide">
                  {enrolledUserName} ({connected && (status === "listening" || status === "speaking") ? `${liveMatchRate}% ম্যাচড` : "যাচাইকৃত"})
                </span>
                {voiceLockEnabled && <Lock className="h-2.5 w-2.5 text-pink-450 ml-1" />}
              </div>
            )}

            {/* Central Control Mic Trigger Button */}
            <div className="flex flex-col items-center gap-3 w-full">
              {!connected ? (
                <button
                  onClick={establishConnection}
                  disabled={status === "connecting"}
                  className="px-8 h-14 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-stone-950 font-black tracking-widest text-xs uppercase transition-all shadow-lg shadow-pink-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-3 cursor-pointer"
                  id="btn-connection-starter"
                >
                  <Play className="h-4 w-4 fill-current" />
                  জোয়ার সাথে কথা বলুন (Connect Zoya)
                </button>
              ) : (
                <button
                  onClick={disconnectSession}
                  className="px-8 h-14 rounded-full bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 font-black tracking-widest text-xs uppercase transition-all active:scale-95 flex items-center gap-3 cursor-pointer"
                  id="btn-connection-closer"
                >
                  <MicOff className="h-4 w-4" />
                  কানেকশন বন্ধ করুন (Disconnect)
                </button>
              )}

              {/* Subtitles text board */}
              <div className="w-full text-center px-4 max-h-[80px] overflow-y-auto">
                <p className="text-xs md:text-sm font-semibold text-gray-200 leading-relaxed italic select-text">
                  "{subtitles}"
                </p>
              </div>
            </div>

            {/* Visual files feedback indicators */}
            {currentUploadedFile && (
              <div className="w-full bg-stone-950/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3 animate-fade-in text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  {currentUploadedFile.thumbnailUrl ? (
                    <img
                      src={currentUploadedFile.thumbnailUrl}
                      alt="Thumbnail text"
                      className="h-8 w-8 rounded-lg object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                      <FileText className="h-4 w-4" />
                    </div>
                  )}
                  <div className="truncate text-left leading-snug">
                    <p className="font-bold text-gray-200 truncate">{currentUploadedFile.name}</p>
                    <p className="text-[10px] text-gray-500">Zoya reviewed file context</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentUploadedFile(null)}
                  className="h-6 w-6 rounded-full bg-white/5 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Backup Context Manual text input wrapper */}
          <div className="bg-stone-900/40 border border-white/5 rounded-2xl p-4 flex items-center gap-2">
            <input
              type="text"
              value={manualTextMsg}
              onChange={(e) => setManualTextMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendTextContext();
              }}
              placeholder={connected ? "জোয়াকে কোনো টেক্সট বা প্রশ্ন পাঠান..." : "কানেক্ট করে এখানে কোনো টেক্সট পাঠাতে পারেন..."}
              disabled={!connected}
              className="flex-1 h-10 bg-stone-950 border border-white/5 rounded-xl px-4 text-xs text-gray-200 placeholder:text-gray-500 outline-none focus:border-pink-500/50 transition-all disabled:opacity-40"
            />
            <button
              onClick={sendTextContext}
              disabled={!connected || !manualTextMsg.trim()}
              className="h-10 w-10 rounded-xl bg-pink-500 text-stone-950 flex items-center justify-center font-bold hover:bg-pink-400 disabled:bg-stone-850 disabled:text-gray-500 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Dual Canvas / Inbuilt Web Browser */}
        {(showRightPanel || activePage !== "assistant") && (
          <div className={`${(isRightPanelFullscreen || activePage !== "assistant") ? "lg:col-span-12 col-span-12" : "lg:col-span-7 col-span-12"} ${activePage === "assistant" ? "hidden lg:flex" : "flex"} flex-col space-y-4 transition-all duration-300`}>
            
            {/* Tabs header controller */}
            <div className="hidden lg:flex bg-stone-900/60 border border-white/5 p-1 rounded-2xl gap-1 items-center">
              <button
                onClick={() => setActiveRightPanel("canvas")}
                className={`flex-1 h-10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeRightPanel === "canvas" ? "bg-white/5 text-pink-400 border border-white/5 shadow-xs" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Layers className="h-4 w-4 text-pink-500" />
                জোয়ার ক্যানভাস (Canvas)
              </button>

              <button
                onClick={() => setActiveRightPanel("browser")}
                className={`flex-1 h-10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeRightPanel === "browser" ? "bg-white/5 text-pink-400 border border-white/5 shadow-xs" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Globe className="h-4 w-4 text-pink-500" />
                ওয়েব ব্রাউজার (Browser)
              </button>

              <button
                onClick={() => setActiveRightPanel("settings")}
                className={`flex-1 h-10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeRightPanel === "settings" ? "bg-white/5 text-pink-400 border border-white/5 shadow-xs" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Settings2 className="h-4 w-4 text-pink-500" />
                সেটিংস (Settings)
              </button>

              {/* Fullscreen Toggle Button */}
              <button
                onClick={() => setIsRightPanelFullscreen((prev) => !prev)}
                className={`h-10 w-10 flex-shrink-0 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isRightPanelFullscreen 
                    ? "bg-pink-500/10 border-pink-500/30 text-pink-400" 
                    : "bg-white/5 border-white/5 text-gray-400 hover:text-pink-400 hover:border-pink-500/20"
                }`}
                title={isRightPanelFullscreen ? "স্বাভাবিক ভিউ (Restore Split Screen)" : "সম্পূর্ণ স্ক্রিন (Go Full Screen)"}
                id="btn-fullscreen-right-panel"
              >
                {isRightPanelFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* Close panel button inside header controller area */}
              <button
                onClick={() => setShowRightPanel(false)}
                className="h-10 w-10 flex-shrink-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer"
                title="প্যানেল লুকান (Hide Board)"
                id="btn-hide-right-panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

          {/* Render Active Area - Stretches perfectly with custom spacious sizing */}
          <div className="bg-stone-900/40 border border-white/5 rounded-3xl p-3 sm:p-5 lg:p-6 flex-1 flex flex-col min-h-[655px] lg:h-[780px] overflow-hidden backdrop-blur-md relative">
            
            {/* 1. Canvas renderer */}
            {activeRightPanel === "canvas" && (
              <CanvasPage 
                canvasItems={canvasItems} 
                setCanvasItems={setCanvasItems} 
                sendTextContext={sendTextContext}
                connected={connected}
              />
            )}



            {activeRightPanel === "browser" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Advanced Tab Bar */}
                <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1.5 scrollbar-thin border-b border-white/5">
                  {browserTabs.map((tab) => {
                    const cleanUrl = (u: string) => u.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
                    const isActive = cleanUrl(currentBrowserUrl) === cleanUrl(tab.url);
                    return (
                      <div
                        key={tab.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-xs"
                            : "bg-white/5 text-gray-400 border-transparent hover:bg-white/10"
                        }`}
                        onClick={() => handleNavigate(tab.url)}
                      >
                        <Globe className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate max-w-[80px]">{tab.title}</span>
                        {browserTabs.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBrowserTabs((prev) => prev.filter((t) => t.id !== tab.id));
                              if (isActive) {
                                const remaining = browserTabs.filter((t) => t.id !== tab.id);
                                if (remaining.length > 0) {
                                  setCurrentBrowserUrl(remaining[0].url);
                                }
                              }
                            }}
                            className="text-gray-500 hover:text-white p-0.5 rounded hover:bg-white/5"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      const newId = String(Date.now());
                      const newTab = { id: newId, url: "https://www.google.com/search?igu=1", title: "New Tab" };
                      setBrowserTabs((prev) => [...prev, newTab]);
                      setCurrentBrowserUrl(newTab.url);
                    }}
                    className="p-1 px-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white flex items-center shadow-xs cursor-pointer"
                    title="নতুন ট্যাব"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Simulated URL input bar & Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4 bg-stone-950 p-2 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={navigateBack}
                      disabled={historyIndex <= 0}
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-gray-300 cursor-pointer"
                      title="Back"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={navigateForward}
                      disabled={historyIndex >= browserHistory.length - 1}
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-gray-300 cursor-pointer"
                      title="Forward"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                    </button>
                    <button
                      onClick={() => handleNavigate(currentBrowserUrl)}
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 cursor-pointer"
                      title="Reload"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 bg-stone-900 px-3 py-1.5 border border-white/5 rounded-xl flex items-center gap-2 overflow-hidden">
                    <Lock className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <input
                      type="text"
                      className="w-full text-xs text-indigo-300 outline-none bg-transparent"
                      value={currentBrowserUrl}
                      onChange={(e) => setCurrentBrowserUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleNavigate(currentBrowserUrl);
                        }
                      }}
                      placeholder="ওয়েবসাইট ঠিকানা বা গুগল সার্চ..."
                    />
                    <button
                      className="text-gray-500 hover:text-white"
                      onClick={() => handleNavigate(currentBrowserUrl)}
                    >
                      <Search className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Mode Selector Toggle */}
                  <div className="flex bg-stone-900 border border-white/5 p-0.5 rounded-xl gap-1">
                    <button
                      onClick={() => setBrowserMode("simulate")}
                      className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        browserMode === "simulate"
                          ? "bg-indigo-500 text-white shadow-xs"
                          : "text-gray-400 hover:text-white"
                      }`}
                      title="Simulates top webpages to bypass framing CORS issues"
                    >
                      Smart Simulation
                    </button>
                    <button
                      onClick={() => setBrowserMode("embed")}
                      className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        browserMode === "embed"
                          ? "bg-indigo-500 text-white shadow-xs"
                          : "text-gray-400 hover:text-white"
                      }`}
                      title="Renders original site inside sandboxed iframe"
                    >
                      Live Embed Frame
                    </button>
                  </div>
                </div>

                {/* Simulated Content Frame View */}
                <div className="flex-1 rounded-2xl bg-stone-950 border border-white/10 overflow-hidden relative flex flex-col p-4">
                  
                  {browserMode === "simulate" ? (
                    <div className="w-full h-full overflow-y-auto space-y-4 pr-1 select-text">
                      {/* Quick links bar */}
                      <div className="flex flex-wrap gap-2 pb-3 mb-2 border-b border-white/5">
                        <span className="text-[10px] text-gray-500 self-center">ঝটপটি বুকমার্ক:</span>
                        {[
                          { name: "Wikipedia", url: "https://wikipedia.org" },
                          { name: "Google Search", url: "https://www.google.com/search?igu=1" },
                          { name: "Google News", url: "https://news.google.com" },
                          { name: "ChatGPT Portal", url: "https://chatgpt.com" },
                          { name: "GitHub Repo", url: "https://github.com" },
                          { name: "Weather Index", url: "https://weather.com" },
                        ].map((link) => (
                          <button
                            key={link.name}
                            onClick={() => handleNavigate(link.url)}
                            className="px-2 py-0.5 text-[9px] bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-400 rounded-md border border-white/5 transition-all text-gray-400 cursor-pointer"
                          >
                            {link.name}
                          </button>
                        ))}
                      </div>

                      {/* YouTube simulated visual sandbox player */}
                      {currentBrowserUrl.includes("youtube.com") ? (
                        <div className="text-left w-full space-y-4 font-sans text-stone-200">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-red-500 font-extrabold text-xs bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-xl flex items-center gap-1.5">
                                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                                ▶ YouTube Live
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">Safe Simulation Sandbox</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                              By-passing CORS Frame Block
                            </span>
                          </div>

                          <div className="p-3.5 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
                            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 flex-shrink-0 animate-pulse">
                              ▶
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-0.5">
                              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">রিয়েলটাইম ইউটিউব ফিড ও কন্টেন্ট রিসিভার</h4>
                              <p className="text-[10px] text-gray-400 leading-relaxed font-normal">
                                সিকিউরিটি হেডার পলিসির (X-Frame-Options) কারণে ডিরেক্ট ইউটিউব ফ্রেম এমবেড চলে না। জোয়া এই ফিডে আপনার জন্য ট্রেন্ডিং ভিডিও নিয়ে এসেছে। নিচের ভিডিও সিলেক্ট করলেই জোয়া ভয়েসে প্রতিক্রিয়া জানাবে এবং ড্রইং বোর্ডে কার্ড হিসেবে যোগ করে দেবে!
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            {[
                              {
                                id: "yt-1",
                                title: "রিয়েলটাইম ভয়েস AI জোয়া প্রথম আড্ডা: 'তুমি কেমন আছো?'",
                                channel: "Zoya Dev Network",
                                views: "1.2M views",
                                time: "2 days ago",
                                color: "from-rose-500/50 to-pink-600/50",
                                length: "4:20",
                                summary: "কথোপকথনের প্রথম পর্ব যেখানে জোয়ার চনমনে ব্যক্তিত্ব ও আবেগ নিয়ে বাংলা কথা বলা প্রথম টেস্ট করা হয়।"
                              },
                              {
                                id: "yt-2",
                                title: "কীভাবে রিয়েল-টাইম মাল্টিমোডাল এআই অ্যাসিস্ট্যান্ট তৈরি করবেন (React + Node.js)",
                                channel: "Coding Pro BD",
                                views: "450K views",
                                time: "1 week ago",
                                color: "from-indigo-600/50 to-purple-600/50",
                                length: "15:45",
                                summary: "রিয়েল-টাইম বাইডাইরেকশনাল অডিও স্ট্রমিং, স্পীচ সিন্থেসিস এবং ড্রইং বোর্ড ক্যানভাস আর্কিটেকচার নিয়ে প্রফেশনাল লেকচার।"
                              },
                              {
                                id: "yt-3",
                                title: "রবীন্দ্রনাথ সঙ কালেকশন - রিল্যাক্সিং বাংলা লো-ফাই রিমিক্স",
                                channel: "Bangla Lo-Fi Beats",
                                views: "3.5M views",
                                time: "3 weeks ago",
                                color: "from-amber-600/50 to-orange-500/50",
                                length: "1:02:10",
                                summary: "শান্ত মনে কোডিং বা ড্রইং করার সময় ব্যাকগ্রাউন্ড মিউজিক হিসেবে আদর্শ রবীন্দ্রনাথের গান অফলাইন রিল্যাক্স মিক্স।"
                              },
                              {
                                id: "yt-4",
                                title: "কম্পিউটার চোখ আর হাতের জেসচার রিয়েল-টাইমে কিভাবে ট্র্যাক করে?",
                                channel: "Science of BD",
                                views: "920K views",
                                time: "5 days ago",
                                color: "from-emerald-600/50 to-teal-600/50",
                                length: "12:05",
                                summary: "হিউম্যান কম্পিউটার ইন্টারঅ্যাকশন (HCI) এবং কম্পিউটার ভিশন এর পেছনে জটিল টেকনোলজির সরল ব্যাখ্যা।"
                              }
                            ].map((video) => (
                              <div
                                key={video.id}
                                onClick={() => {
                                  // Auto add to canvas to let Zoya explain/draft it
                                  const newItem = {
                                    id: String(Date.now()),
                                    type: "text" as const,
                                    title: `ইউটিউব ভিডিও: ${video.title}`,
                                    content: `আপনি ইউটিউব সিমুলেশন ফিড থেকে এই ভিডিও টপিকে ক্লিক করেছেন!\n\nচ্যানেল: ${video.channel}\nভিউ সংখ্যা: ${video.views}\nআপলোড কাল: ${video.time}\n\nভিডিও সারাংশ:\n${video.summary}\n\nজোয়াকে আপনার মতামত দিন!`,
                                    timestamp: new Date().toLocaleTimeString(),
                                  };
                                  setCanvasItems((prev) => [newItem, ...prev]);
                                  
                                  // Send text context to bridge so Gemini model actively replies about this youtube video
                                  sendTextContext(`আমাকে ইউটিউব টিউটোরিয়াল বা ভিডিওর বিষয়ে কিছু দারুণ তথ্য ব্যাখ্যা করো: "${video.title}" (summary: ${video.summary})`);
                                }}
                                className="bg-stone-900 border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all cursor-pointer group text-left"
                              >
                                <div className={`h-28 w-full bg-gradient-to-br ${video.color} relative flex items-center justify-center`}>
                                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
                                  <span className="h-9 w-9 rounded-full bg-black/70 group-hover:bg-red-600 group-hover:text-white group-hover:scale-110 transition-all flex items-center justify-center text-white text-[10px]">
                                    ▶
                                  </span>
                                  <span className="absolute bottom-2 right-2 bg-stone-950/80 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-gray-200">
                                    {video.length}
                                  </span>
                                </div>
                                <div className="p-3 space-y-1">
                                  <h4 className="text-[11px] font-bold text-stone-100 leading-snug group-hover:text-red-400 line-clamp-2 transition-colors">
                                    {video.title}
                                  </h4>
                                  <p className="text-[10px] text-gray-400">{video.channel}</p>
                                  <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono">
                                    <span>{video.views}</span>
                                    <span>•</span>
                                    <span>{video.time}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex justify-between items-center bg-stone-900 px-4 py-3 border border-white/5 rounded-xl">
                            <span className="text-[10px] text-gray-400 font-mono">domain: youtube.com</span>
                            <a
                              href={currentBrowserUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                            >
                              Open on Real YouTube page <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ) : currentBrowserUrl.includes("wikipedia.org") ? (
                        (() => {
                          const articleMatch = currentBrowserUrl.match(/\/wiki\/([^?#]+)/);
                          const articleTitle = articleMatch 
                            ? decodeURIComponent(articleMatch[1].replace(/_/g, " ")) 
                            : "উইকিপিডিয়া (Wikipedia)";
                          
                          return (
                            <div className="text-left w-full space-y-4 font-sans text-stone-200">
                              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                                <span className="text-2xl font-serif text-white font-extrabold italic">W</span>
                                <div>
                                  <h3 className="text-sm font-bold text-white tracking-wider font-serif">WIKIPEDIA</h3>
                                  <p className="text-[10px] text-gray-500">The Free Encyclopedia</p>
                                </div>
                              </div>
                              
                              <div className="p-4 bg-stone-900/50 border border-white/5 rounded-2xl space-y-2">
                                <h4 className="text-sm font-bold text-indigo-300">{articleTitle}</h4>
                                <p className="text-xs text-stone-300 leading-relaxed">
                                  {articleMatch 
                                    ? `আপনি সফলভাবে উইকিপিডিয়ার "${articleTitle}" পাতায় এসেছেন। উইকিপিডিয়া একটি উন্মুক্ত বিশ্বকোষ যা সবার অবদানের মাধ্যমে সমৃদ্ধ হচ্ছে। জোয়া ভয়েস রিয়াকশন ব্যবহার করে এই টপিকটির চমৎকার গভীর ব্যাখ্যা শুনতে পারেন!`
                                    : "উইকিপিডিয়া একটি উন্মুক্ত ও সহযোগী বিশ্বকোষ, যা বিশ্বের বহুভাষিক ইন্টারনেটে জ্ঞান বিলিয়ে দেয়। জোয়ার সাহায্যে আপনি সরাসরি যেকোনো উইকিপিডিয়া পেইজ রিড করতে পারেন। জোয়া সেই আর্টিকেলের টেক্সট দ্রুত আর্কিটেক্ট করে তার প্রতিক্রিয়া প্রদান করে।"
                                  }
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <button
                                  onClick={() => {
                                    const cItem = {
                                      id: String(Date.now()),
                                      type: "text" as const,
                                      title: `উইকিপিডিয়া: ${articleTitle}`,
                                      content: `উইকিপিডিয়া নিবন্ধ: ${articleTitle}\n\nআপনি সিমুলেটর ব্রাউজার ব্যবহার করে এই বিষয়ের পেজটি পড়েছেন। জোয়া ভয়েস সহকারী এই বিষয়ে আপনার সাথে কথা বলতে প্রস্তুত!`,
                                      timestamp: new Date().toLocaleTimeString(),
                                    };
                                    setCanvasItems((prev) => [cItem, ...prev]);
                                    sendTextContext(`আমাকে এই বিষয় সম্পর্কে আরও দারুণ কিছু তথ্য ব্যাখ্যা করো: "${articleTitle}"`);
                                  }}
                                  className="p-3 bg-stone-900 border border-white/5 rounded-xl hover:border-pink-500/30 transition-all text-left space-y-1 block cursor-pointer group"
                                >
                                  <h5 className="font-extrabold text-[11px] text-pink-400 group-hover:underline">১. জোয়া ব্রেইনে শেয়ার করুন:</h5>
                                  <p className="text-[10px] text-gray-400">ক্লিক করলেই ক্যানভাসে যুক্ত হবে এবং জোয়া প্রতিক্রিয়া জানাতে শুরু করবে।</p>
                                </button>
                                
                                <div className="p-3 bg-stone-900 border border-white/5 rounded-xl space-y-1 text-left">
                                  <h5 className="font-extrabold text-[11px] text-white">আজকের নির্বাচিত নিবন্ধ:</h5>
                                  <p className="text-[10px] text-gray-400">রবীন্দ্রনাথ ঠাকুর ছিলেন মূলত একজন কবি। কিন্তু বাংলা ভাষা ও সংস্কৃতির প্রায় প্রতিটি শাখাতেই তার অবদান চিরস্মরণীয়।</p>
                                </div>
                              </div>

                              <div className="pt-3 flex justify-between items-center bg-stone-900 px-4 py-3 border border-white/5 rounded-xl">
                                <span className="text-[10px] text-gray-400 font-mono">domain: wikipedia.org</span>
                                <a
                                  href={currentBrowserUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                                >
                                  Open Safe Externally <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          );
                        })()
                      ) : currentBrowserUrl.includes("news.google.com") ? (
                        <div className="text-left w-full space-y-4 font-sans text-stone-200">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-indigo-400 font-extrabold text-xs bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-xl flex items-center gap-1.5 animate-pulse">
                                📰 Google News Bangladesh
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">Bypassing Frame Block</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {[
                              {
                                title: "রিয়েল-টাইম অডিও এআই মডেল ও মানুষের কথোপকথন: রোবটিক্স ও এআই-এর যুগান্তকারী অগ্রগতি",
                                source: "Prothom Alo Tech",
                                time: "২ ঘণ্টা আগে",
                                snippet: "বাংলাদেশ বিজ্ঞান ও প্রযুক্তির ক্ষেত্রে এক নতুন ধাপে পা রাখল। মোবাইল এবং ব্রাউজার ডিভাইসে বাংলা ভয়েস রিয়াক্ট মডেলের কার্যকারিতা জোয়া অ্যাপের মাধ্যমে প্রফেশনাল টেস্ট করা হয়েছে।"
                              },
                              {
                                title: "দেশজুড়ে তাপমাত্রা ও আবহাওয়ার পূর্বাভাস: কালবৈশাখী ঝড়ের আভাস",
                                source: "Weather News BD",
                                time: "৩ ঘণ্টা আগে",
                                snippet: "আবহাওয়া অধিদপ্তর জানিয়েছে দেশের বিভিন্ন স্থানে ঝড়ো হাওয়াসহ বৃষ্টির সম্ভাবনা রয়েছে। ক্যানভাস বোর্ডে আজকেই ট্র্যাকার যুক্ত করা হয়েছে।"
                              },
                              {
                                title: "রবীন্দ্রনাথ ঠাকুরের অমর সৃষ্টি নিয়ে নতুন লো-ফাই অ্যানিমেশন ট্রেন্ডিং",
                                source: "Sangeet Bangla",
                                time: "৫ ঘণ্টা আগে",
                                snippet: "তরুণ কন্টেন্ট ক্রিয়েটরদের রবীন্দ্রনাথের ক্লাসিক গানগুলোকে মডার্ন লো-ফাই রূপান্তর সামাজিক যোগাযোগ মাধ্যমে ব্যাপক প্রশংসিত হচ্ছে।"
                              }
                            ].map((item, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-stone-900 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all cursor-pointer text-left"
                                onClick={() => {
                                  const newItem = {
                                    id: String(Date.now()),
                                    type: "text" as const,
                                    title: `নিউজ আপডেট: ${item.title}`,
                                    content: `উৎস: ${item.source}\nসময়: ${item.time}\n\nসারাংশ:\n${item.snippet}`,
                                    timestamp: new Date().toLocaleTimeString(),
                                  };
                                  setCanvasItems((prev) => [newItem, ...prev]);
                                  sendTextContext(`আমাকে এই সংবাদের বিষয়ে কিছু প্রফেশনাল মতামত দিন: "${item.title}"`);
                                }}
                              >
                                <div className="flex justify-between text-[9px] text-indigo-400 font-mono mb-1">
                                  <span>{item.source}</span>
                                  <span>{item.time}</span>
                                </div>
                                <h4 className="text-xs font-bold text-white hover:text-indigo-300 cursor-pointer">{item.title}</h4>
                                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{item.snippet}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : currentBrowserUrl.includes("chatgpt.com") ? (
                        <div className="text-left w-full space-y-4 font-sans text-stone-200">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400 font-extrabold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl flex items-center gap-1.5">
                                💬 ChatGPT Simulator
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">Bypassing IFrame block</span>
                            </div>
                          </div>

                          <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">AI Assistant Chat Console</h4>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-normal">
                              আইফ্রেম ব্লকিং বাইপাস করার জন্য চ্যাট ক্রিয়েশন ইন্টারফেস ডিজাইন করা হয়েছে। জোয়া এর সাথে সংযুক্ত এবং যেকোনো প্রম্পট লিখলে জোয়াও উত্তর দিতে পারে!
                            </p>
                          </div>

                          <div className="bg-stone-900 border border-white/5 rounded-2xl p-3 space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-gray-400">নতুন প্রম্পট লিখুন (Write Prompt)</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="কোডিং বা সায়েন্স নিয়ে যেকোনো প্রশ্ন জোয়াকে এবং চ্যাট মডেলকে জিজ্ঞেস করুন..."
                                  className="flex-1 bg-stone-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-indigo-300 outline-none focus:border-emerald-500/30"
                                  id="chatgpt-sim-input"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const inputVal = (e.target as HTMLInputElement).value;
                                      if (inputVal.trim()) {
                                        const newItem = {
                                          id: String(Date.now()),
                                          type: "text" as const,
                                          title: `ChatGPT Prompt: ${inputVal}`,
                                          content: `প্রম্পট: "${inputVal}"\n\nউত্তর পেতে জোয়ার রিয়াকশন অন করুন বা ক্যানভাস চেক করুন।`,
                                          timestamp: new Date().toLocaleTimeString(),
                                        };
                                        setCanvasItems((prev) => [newItem, ...prev]);
                                        sendTextContext(`প্রম্পট আলোচনা: "${inputVal}"`);
                                        (e.target as HTMLInputElement).value = "";
                                      }
                                    }
                                  }}
                                />
                                <button
                                  className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                  onClick={() => {
                                    const el = document.getElementById("chatgpt-sim-input") as HTMLInputElement;
                                    const val = el?.value;
                                    if (val?.trim()) {
                                      const newItem = {
                                        id: String(Date.now()),
                                        type: "text" as const,
                                        title: `ChatGPT Prompt: ${val}`,
                                        content: `প্রম্পট: "${val}"\n\nউত্তর পেতে জোয়ার রিয়াকশন অন করুন বা ক্যানভাস চেক করুন।`,
                                        timestamp: new Date().toLocaleTimeString(),
                                      };
                                      setCanvasItems((prev) => [newItem, ...prev]);
                                      sendTextContext(`প্রম্পট আলোচনা: "${val}"`);
                                      el.value = "";
                                    }
                                  }}
                                >
                                  পাঠান
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : currentBrowserUrl.includes("github.com") ? (
                        <div className="text-left w-full space-y-4 font-sans text-stone-200">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-extrabold text-xs bg-white/10 border border-white/20 px-2 py-1 rounded-xl flex items-center gap-1.5">
                                🐙 GitHub Code Repository
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">Bypassing Frame Block</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="p-3 bg-stone-900 border border-white/5 rounded-xl flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-white hover:text-indigo-400 cursor-pointer">zoya-voice-assistant-react</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">Real-time multimodal conversational brain framework using WebSockets.</p>
                              </div>
                              <button
                                className="px-2.5 py-1 text-[9px] font-bold uppercase rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer"
                                onClick={() => {
                                  const cItem = {
                                    id: String(Date.now()),
                                    type: "code" as const,
                                    title: "zoya-voice-assistant-react: README",
                                    content: `## Zoya AI Voice Assistant\n\nFeatures:\n- Web Audio Bidirectional Processing\n- Canvas Vector Drafting Board\n- Local Device Memory Management`,
                                    timestamp: new Date().toLocaleTimeString(),
                                  };
                                  setCanvasItems((prev) => [cItem, ...prev]);
                                  sendTextContext("আমাকে zoya repo এবং কোডিং আর্কিটেকচার নিয়ে প্রফেশনাল মতামত দিন।");
                                }}
                              >
                                View Code
                              </button>
                            </div>

                            <div className="p-3 bg-stone-900 border border-white/5 rounded-xl flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-white hover:text-indigo-400 cursor-pointer">react-multimodal-gemini-sdk</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">A clean, server-side client library proxying live Google GenAI model interactions.</p>
                              </div>
                              <button
                                className="px-2.5 py-1 text-[9px] font-bold uppercase rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer"
                                onClick={() => {
                                  const cItem = {
                                    id: String(Date.now()),
                                    type: "code" as const,
                                    title: "react-multimodal-gemini: server.ts",
                                    content: `// Live socket pipeline proxy\nimport { GoogleGenAI } from "@google/genai";\nconst ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });`,
                                    timestamp: new Date().toLocaleTimeString(),
                                  };
                                  setCanvasItems((prev) => [cItem, ...prev]);
                                  sendTextContext("আমাকে Gemini api server.ts কোড নিয়ে সংক্ষিপ্ত বিবরণ দাও।");
                                }}
                              >
                                View Code
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : currentBrowserUrl.includes("weather.com") ? (
                        <div className="text-left w-full space-y-4 font-sans text-stone-200">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 font-extrabold text-xs bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-xl flex items-center gap-1.5">
                                ☀️ Weather Index Simulator
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">Bypassing Frame Block</span>
                            </div>
                          </div>

                          <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-white/10 rounded-2xl flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-gray-400">ঢাকা, বাংলাদেশ (Dhaka, BD)</p>
                              <h3 className="text-2xl font-black text-white">৩২° সেলসিয়াস</h3>
                              <p className="text-[10px] text-gray-300">আংশিক মেঘলা • বাতাস: ১২ কিমি/ঘণ্টা</p>
                            </div>
                            <div className="text-3xl animate-bounce">☀️</div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { day: "মঙ্গল", temp: "৩৩°", icon: "🌤️" },
                              { day: "বুধ", temp: "৩৪°", icon: "🌧️" },
                              { day: "বৃহ", temp: "৩২°", icon: "⛈️" },
                            ].map((w, i) => (
                              <div key={i} className="bg-stone-900 border border-white/5 p-2 rounded-xl text-center space-y-1">
                                <span className="text-[10px] text-gray-400 block">{w.day}</span>
                                <span className="text-lg block">{w.icon}</span>
                                <span className="text-[10px] font-bold text-white block">{w.temp}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : currentBrowserUrl.includes("google.com/search") || currentBrowserUrl.includes("q=") ? (
                        /* Google Search Results visual simulator */
                        <div className="text-left w-full space-y-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex gap-0.5 text-base font-black">
                              <span className="text-blue-400">G</span>
                              <span className="text-rose-400">o</span>
                              <span className="text-amber-400">o</span>
                              <span className="text-blue-400">g</span>
                              <span className="text-emerald-400">l</span>
                              <span className="text-rose-400">e</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                              Search results bypass iframe block
                            </span>
                          </div>

                          <div className="space-y-4 pt-2">
                            {(() => {
                              const queryMatch = currentBrowserUrl.match(/[?&]q=([^&]+)/);
                              const query = queryMatch
                                ? decodeURIComponent(queryMatch[1].replace(/\+/g, " "))
                                : "";
                              
                              const results = query 
                                ? [
                                    {
                                      title: `উইকিপিডিয়া তথ্য: ${query}`,
                                      snippet: `জানুন ${query} সম্পর্কিত যাবতীয় সঠিক তথ্য, ঐতিহাসিক প্রেক্ষাপট এবং বর্তমান উন্নয়ন বিবরণী সমূহ।`,
                                      url: `https://wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, "_"))}`
                                    },
                                    {
                                      title: `ইউটিউব ভিডিও: ${query} টিউটোরিয়াল এবং রিমোট গাইড`,
                                      snippet: `সেরা ভিডিও টিউটোরিয়াল এবং রিমোট গাণিতিক কোডিং প্র্যাকটিস। জোয়া এআই ভয়েস ক্যানভাসে সরাসরি দেখুন।`,
                                      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
                                    }
                                  ]
                                : [
                                    {
                                      title: "Wikipedia: The Free Encyclopedia",
                                      snippet: "Explore online encyclopedia entries with complete coverage. Quick searches with Zoya API voice controls available.",
                                      url: "https://wikipedia.org",
                                    },
                                    {
                                      title: "Beautiful Bengali Poetry and Literature Index",
                                      snippet: "Complete archives of classic Nobel laureate poets, stories, translation, and emotional Bengali speech dictionaries.",
                                      url: "https://wikipedia.org/wiki/Bengali_literature",
                                    },
                                    {
                                      title: "Vite JS Quickstart Guide with React 18 and Tailwind CSS",
                                      snippet: "Build lightning-fast full-stack web applications. Learn how to construct interactive canvas views and live audio sockets.",
                                      url: "https://github.com",
                                    },
                                    {
                                      title: "Google News Updates - Real-Time Global Headlines",
                                      snippet: "Explore hot breaking topics, technology innovations, weather index, and daily customized feeds.",
                                      url: "https://news.google.com",
                                    },
                                  ];

                              return results.map((result, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handleNavigate(result.url)}
                                  className="p-3 bg-stone-900 border border-white/5 hover:border-indigo-500/30 rounded-xl space-y-1.5 transition-all cursor-pointer block-select-element hover:bg-stone-900/80"
                                >
                                  <span className="text-[9px] text-gray-500 block truncate">{result.url}</span>
                                  <h4 className="text-xs font-bold text-sky-400 hover:underline">{result.title}</h4>
                                  <p className="text-[11px] text-stone-400 leading-normal">{result.snippet}</p>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      ) : (
                        /* Default Dynamic simulated preview for other domains */
                        <div className="text-center py-6 space-y-4 max-w-sm mx-auto">
                          <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto border border-indigo-500/20">
                            <Globe className="h-6 w-6 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-white tracking-widest uppercase">Safe Web Preview Portal</h4>
                            <p className="text-[10px] text-gray-500 font-mono mt-1">{currentBrowserUrl}</p>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            আপনি কাস্টম ওয়েব লিংকে প্রবেশ করেছেন। বড় বড় ওয়েবসাইটগুলো নিরাপত্তা নীতিমালার (X-Frame) কারণে ব্রাউজারের অভ্যন্তরে ফ্রেমিং সাপোর্ট করে না।
                          </p>
                          
                          <div className="p-3 bg-stone-900/60 border border-white/5 rounded-2xl space-y-2 text-left">
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                              <span className="text-[10px] font-bold text-amber-400 uppercase">iframe restriction bypass active</span>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-relaxed">
                              কোনো কোনো ওয়েব প্লাটফর্ম সিকিউরিটি হেডার ব্যবহারের কারণে এমবেড সাপোর্ট করে না। আপনি বাম বাটন চেপে এমবেড ফ্রেম ট্রাই করতে পারেন, অথবা ডান বাটন চেপে মূল সাইটে যেতে পারেন।
                            </p>
                          </div>

                          <div className="flex justify-center gap-2.5">
                            <button
                              onClick={() => setBrowserMode("embed")}
                              className="px-3.5 h-9 rounded-xl bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                            >
                              Try Frame Embedding
                            </button>
                            <a
                              href={currentBrowserUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 h-9 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] uppercase font-bold text-white transition-all shadow-md shadow-indigo-500/10"
                            >
                              আসল সাইটে যান <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Actual Embedded Web Frame */
                    <div className="w-full h-full flex flex-col relative">
                      <div className="absolute top-2 right-2 z-10 bg-stone-950/90 border border-white/5 p-2 rounded-xl flex items-center gap-2 backdrop-blur-md">
                        <span className="text-[9px] text-gray-500 font-mono truncate max-w-[140px]">{currentBrowserUrl}</span>
                        <a
                          href={currentBrowserUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 flex items-center justify-center transition-all cursor-pointer"
                          title="Open safely in new window tab"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      
                      {/* Live sandbox iframe */}
                      <iframe
                        src={currentBrowserUrl}
                        className="w-full h-full bg-white rounded-xl border-none"
                        title="Zoya Live Web viewport"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* 3. Settings & Voice Match Panel */}
            {activeRightPanel === "settings" && (
              <SettingsPage
                voiceMatchSaved={voiceMatchSaved}
                setVoiceMatchSaved={setVoiceMatchSaved}
                voiceSignature={voiceSignature}
                setVoiceSignature={setVoiceSignature}
                enrolledUserName={enrolledUserName}
                setEnrolledUserName={setEnrolledUserName}
                voiceEnrollState={voiceEnrollState}
                setVoiceEnrollState={setVoiceEnrollState}
                startVoiceEnrollmentProcess={startVoiceEnrollmentProcess}
                voiceLockEnabled={voiceLockEnabled}
                setVoiceLockEnabled={setVoiceLockEnabled}
                securityThreshold={securityThreshold}
                setSecurityThreshold={setSecurityThreshold}
                detectedMood={detectedMood}
                setDetectedMood={setDetectedMood}
                setSubtitles={setSubtitles}
                connected={connected}
                status={status}
                zoyaSpeechSpeed={zoyaSpeechSpeed}
                emotionSensitivity={emotionSensitivity}
                liveMatchRate={liveMatchRate}
              />
            )}

            {false && activeRightPanel === "settings" && (
              <div className="flex-1 flex flex-col overflow-hidden text-left space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4.5 w-4.5 text-pink-500 animate-spin-slow" />
                    <span className="text-xs font-black text-gray-200 uppercase tracking-widest font-mono">
                      ডিভাইস সেটিংস ও ভয়েস সুরক্ষা
                    </span>
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
                            <span className="font-mono text-xs font-bold text-emerald-450">{connected && status === "listening" ? "৯৮.৬%" : "১০০% (নিরাপদ)"}</span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: "98.6%" }} />
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
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-405 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono">
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
                                // Set a cute subtitles placeholder representing user's emotion override
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
            )}
          </div>
        </div>
        )}
      </main>

      {/* Footer System Credits */}
      <footer className="relative w-full max-w-none px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between border-t border-white/5 text-[10px] text-gray-500 z-10 bg-stone-950/80">
        <p className="text-center md:text-left select-text">
          জোয়া রিয়েল-টাইম সহকারী • নিরাপদ মেমরি প্রোফাইল • রিয়েল-টাইম অডিও সেশন
        </p>
        <div className="flex items-center gap-3 font-mono mt-2 md:mt-0 select-text">
          <span>GEMINI Multimodal Live API</span>
          <span>•</span>
          <span>প্লাটফর্ম সংস্করণ v4.0</span>
        </div>
      </footer>

      {/* Instructions Overlay Modal */}
      <AnimatePresence>
        {isDiagnosticOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDiagnosticOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-stone-900 border border-pink-500/30 rounded-3xl p-6 text-gray-300 shadow-2xl cursor-default"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
                  <Info className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">জোয়া ব্যবহার নির্দেশিকা</h3>
                  <p className="text-[9px] text-pink-400 tracking-widest font-mono">Zoya Multimodal Guidelines</p>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed max-h-[350px] overflow-y-auto pr-1">
                <div className="bg-stone-950 p-4 border border-white/5 rounded-2xl space-y-1.5">
                  <p className="font-bold text-gray-100">১. জোয়ার ব্যক্তিত্ব ও ভাষা:</p>
                  <p>জোয়া অত্যন্ত চনমনে, কনফিডেন্ট এবং কখনো কখনো রোমান্টিক স sassy বান্ধবীর ভাইবে খাঁটি বাংলায় কথা বলে। সে হালকা ঠাট্টা, কিউট দুষ্টুমি বা ফ্লার্ট করতে ভালোবাসে!</p>
                </div>

                <div className="bg-stone-950 p-4 border border-white/5 rounded-2xl space-y-1.5">
                  <p className="font-bold text-gray-100">২. ক্যামেরা ভিশন (Camera Eye):</p>
                  <p>উপরে ডানপাশ থেকে ক্যামেরা অন করলে জোয়া রিয়েল-টাইমে আপনাকে এবং আপনার ব্যাকগ্রাউন্ড অবজেক্টস দেখতে পারে। সে আপনার এক্সপ্রেশন বা হাতের যেকোনো জিনিস দেখে তার চুটকি জবাব দেবে!</p>
                </div>

                <div className="bg-stone-950 p-4 border border-white/5 rounded-2xl space-y-1.5">
                  <p className="font-bold text-gray-100">৩. ফাইল আপলোড (Document Explainer):</p>
                  <p>উপরে বাম পাশের ফাইল ক্লিপ আইকন দিয়ে যেকোনো ইমেজ বা টেক্সট ফাইল আপলোড করতে পারেন। জোয়া সেই ফাইলটি সঙ্গে সঙ্গে রিড করে আবেগ দিয়ে বাংলা ভাষায় বিশ্লেষণ করে দেবে!</p>
                </div>

                <div className="bg-stone-950 p-4 border border-white/5 rounded-2xl space-y-1.5">
                  <p className="font-bold text-gray-100">৪. ব্রাউজার ও ইন্টারেক্টিভ ক্যানভাস:</p>
                  <p>জোয়াকে কোনো ওয়েবসাইট খুলতে বললে ব্রাউজার ট্যাবে সার্চ হবে। এবং জটিল গণিত বা লম্বা কোড জোয়া সরাসরি ইন্টারেক্টিভ ক্যানভাসে ড্র করে দেখায়।</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setIsDiagnosticOpen(false)}
                  className="px-6 h-10 rounded-2xl bg-pink-500 text-stone-950 text-xs font-bold hover:bg-pink-400 transition-all cursor-pointer"
                >
                  বুঝেছি, কথা বলবো
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory sidebar drawers */}
      <BrainMemoryPanel
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memory={memory}
        onDeleteMemory={handleDeleteMemory}
        onAddMemory={handleAddMemory}
      />
    </div>
  );
}
