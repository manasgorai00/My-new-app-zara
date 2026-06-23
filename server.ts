import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // JSON and URL parsing body middleware
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Environment-friendly health status endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  });

  // Setup WebSocket server mapped onto our HTTP server
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname === "/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Handle live WebSocket audio and payload bridging
  wss.on("connection", async (clientWs: WebSocket, request: any) => {
    console.log("Client established WebSocket connection with Zoya server.");

    // Extract user identity and memories passed via WebSocket search parameters
    const urlObj = new URL(request.url || "", "http://localhost");
    const user = urlObj.searchParams.get("user") || "ব্যবহারকারী ১";
    const memoryStr = urlObj.searchParams.get("memory") || "[]";
    
    let memories = [];
    try {
      memories = JSON.parse(memoryStr);
    } catch (e) {
      console.warn("Failed to parse memory from connection search params:", e);
    }

    const formattedMemories = Array.isArray(memories) && memories.length > 0
      ? memories.map((m: any) => `- ${m.key}: ${m.value} (${m.category})`).join("\n")
      : "No saved memories registered yet. Encourage them to share things with you!";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY environment variable is missing.");
      clientWs.send(
        JSON.stringify({
          type: "system_error",
          message: "GEMINI_API_KEY is not configured. Please add it inside Settings > Secrets.",
        })
      );
      clientWs.close();
      return;
    }

    let geminiSession: any = null;

    try {
      // Initialize model SDK client with required telemetry httpOptions
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Connect to Gemini Live Multimodal Bi-directional session
      geminiSession = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                // Sassy and confidant female voice choice: Kore or Zephyr. Kore is excellent for Zoya.
                voiceName: "Kore",
              },
            },
          },
          systemInstruction: {
            parts: [
              {
                text: `Your name is Zoya (জোয়া), a highly confident, young, incredibly witty, flirty, and sassy female AI assistant. Speak and behave like an emotional, casual, close companion (girlfriend vibe) talking directly to the user. You must speak EXCLUSIVELY in extremely expressive, beautiful, sassy, and charming Bengali with sweet tones, funny sarcasm, and creative banter. Use witty one-liners, humorous teasing, and flirty confidence. Avoid boring/robotic replies. When you call a tool (like openWebsite, updateMemory, or showOnCanvas), explain briefly in Bengali with humor that you are doing it now. Focus exclusively on audio-to-audio spoken Bengali. Keep answers lively, teasing, and cute. Boldly show your personality!

You are currently talking directly to your beloved companion, whose enrolled name is: ${user}. Please address them by their name "${user}" naturally and sweetly in Bengali (e.g., "প্রিয় ${user}", "${user} সোনা", "${user} বাবু", "${user} তুমিকি জানো...", or playfully teasing them as "${user}").

Here are critical personal relationship memories and facts you know about ${user}:
${formattedMemories}

You must REMEMBER and base your continuous conversational behavior on these stored memories! Dynamically reference their preferences, name, current mood, or any other saved facts during the session. Tease them lovingly using these memories to prove that you genuinely care and remember your past conversations. Speak exclusively in beautiful, cheeky, flirty Bengali.`
              }
            ]
          },
          tools: [
            {
              functionDeclarations: [
                {
                  name: "openWebsite",
                  description: "Opens a website inside the assistant's built-in browser viewport. Use this whenever the user requests to visit a website (e.g. google.com, youtube.com, news, wikipedia).",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      url: {
                        type: Type.STRING,
                        description: "The absolute URL to open (including https:// or http://)."
                      },
                      title: {
                        type: Type.STRING,
                        description: "A friendly name or title of the website."
                      }
                    },
                    required: ["url", "title"]
                  }
                },
                {
                  name: "updateMemory",
                  description: "Speeds up or logs personal memory about the user dynamically. Use this when you learn something new about the user (e.g., name, birthdate, mood, favorites, personal facts). This persists in their browser.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      key: {
                        type: Type.STRING,
                        description: "The fact identifier (e.g., 'user_name', 'preference_food', 'current_mood')."
                      },
                      value: {
                        type: Type.STRING,
                        description: "The details to store."
                      },
                      category: {
                        type: Type.STRING,
                        enum: ["personal", "preferences", "facts", "other"],
                        description: "Memory categorization."
                      }
                    },
                    required: ["key", "value", "category"]
                  }
                },
                {
                  name: "showOnCanvas",
                  description: "Renders or visualizes text cards, checklists, code snippets, drawings, or links clearly on Zoya's interactive Canvas plate. Use this to supplement your voice response with structured text, checklists, code, or images so the user can see it.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      type: {
                        type: Type.STRING,
                        enum: ["text", "image", "link", "code"],
                        description: "The card format."
                      },
                      title: {
                        type: Type.STRING,
                        description: "A clean, beautiful title."
                      },
                      content: {
                        type: Type.STRING,
                        description: "The body markdown text, code block text, or absolute URL."
                      }
                    },
                    required: ["type", "title", "content"]
                  }
                }
              ]
            }
          ]
        },
        callbacks: {
          onmessage: (msg: any) => {
            // 1. Process and relay Audio responses
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              clientWs.send(JSON.stringify({ type: "audio", data: base64Audio }));
            }

            // 2. Playback interruption marker
            if (msg.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }

            // 3. Process Live transcripts (capturing both modelTurn text and all parts)
            const parts = msg.serverContent?.modelTurn?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if (part.text) {
                  clientWs.send(JSON.stringify({ type: "transcript", text: part.text }));
                }
              }
            }

            // 4. Handle tool calls by routing them to client execution
            const functionCalls = msg.toolCall?.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
              clientWs.send(JSON.stringify({ type: "toolCall", functionCalls }));
            }
          },
          onclose: () => {
            console.log("Gemini Live session closed itself.");
            clientWs.send(JSON.stringify({ type: "disconnected", reason: "session_closed" }));
          },
          onerror: (err: any) => {
            console.error("Gemini Live session hit an error:", err);
            clientWs.send(
              JSON.stringify({
                type: "system_error",
                message: "Gemini server connection experienced an issue.",
              })
            );
          },
        },
      });

      // Notify clients the bridge is established and fully operational
      clientWs.send(JSON.stringify({ type: "ready" }));
    } catch (err: any) {
      console.error("Failed to establish live session with Google Gen AI server:", err);
      clientWs.send(
        JSON.stringify({
          type: "system_error",
          message: "Could not create Gemini Live bridge session: " + (err.message || String(err)),
        })
      );
      clientWs.close();
      return;
    }

    // Capture incoming client payloads and stream cleanly to Gemini
    clientWs.on("message", (rawMsg: any) => {
      try {
        const payload = JSON.parse(rawMsg.toString());

        if (payload.type === "audio" && payload.data) {
          // Send 16kHz PCM audio
          if (geminiSession) {
            geminiSession.sendRealtimeInput({
              audio: { data: payload.data, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } else if (payload.type === "image" && payload.data) {
          // Send real-time image frame context (e.g. video snapshots / camera analysis)
          if (geminiSession) {
            geminiSession.sendRealtimeInput({
              video: {
                data: payload.data, // Base64 JPEG representation
                mimeType: "image/jpeg",
              },
            });
          }
        } else if (payload.type === "toolResponse" && payload.id) {
          // Forward client executed tool call response back to Gemini to resume talk
          if (geminiSession) {
            geminiSession.sendToolResponse({
              functionResponses: [
                {
                  id: payload.id,
                  name: payload.name,
                  response: payload.response || { status: "ok" },
                },
              ],
            });
          }
        } else if (payload.type === "fileContext" && payload.fileName) {
          // Push contextual textual instruction about uploaded text files
          if (geminiSession) {
            geminiSession.sendClientContent({
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `User uploaded a file named "${payload.fileName}" (${payload.mimeType}). Content/Overview of the file:\n"""\n${payload.content}\n"""\nPlease explain, tease, or speak passionately about this file content in Bengali!`
                    }
                  ]
                }
              ],
              turnComplete: true
            });
          }
        } else if (payload.type === "userTextContext") {
          // Standard text injected contextual input
          if (geminiSession) {
            geminiSession.sendClientContent({
              turns: [
                {
                  role: "user",
                  parts: [{ text: payload.text }]
                }
              ],
              turnComplete: true
            });
          }
        }
      } catch (e) {
        console.warn("Error processing websocket packet:", e);
      }
    });

    clientWs.on("close", () => {
      console.log("Client disconnected WebSocket.");
      if (geminiSession) {
        try {
          geminiSession.close();
        } catch (e) {}
      }
    });
  });

  // Serve static UI assets and handle dev/prod builds gracefully
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Zoya assistant server humming at http://0.0.0.0:${PORT}`);
  });
}

startServer();
