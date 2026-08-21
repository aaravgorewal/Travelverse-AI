import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, X, Send, Sparkles, AlertCircle } from "lucide-react";

interface AIVoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptComplete: (transcript: string, autoSend?: boolean) => void;
}

export const AIVoiceInputModal: React.FC<AIVoiceInputModalProps> = ({
  isOpen,
  onClose,
  onTranscriptComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      setTranscript("");
      setInterimText("");
      setErrorMessage(null);
    }

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        "Web Speech API is not supported in this browser. Please type your query."
      );
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
        }
        setInterimText(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access was denied. Please allow microphone permissions.");
        } else if (event.error !== "no-speech") {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to access microphone.");
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleConfirmAndSend = (autoSend: boolean = false) => {
    const fullText = (transcript + " " + interimText).trim();
    if (fullText) {
      onTranscriptComplete(fullText, autoSend);
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentDisplayText = (transcript + " " + interimText).trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Status */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>AI Voice Command</span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {isRecording ? "Listening to your request..." : "Voice recording paused"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Speak naturally about destinations, flight options, hotel budgets, or family plans.
          </p>
        </div>

        {/* Animated Mic Wave Pulse */}
        <div className="flex items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <>
                <span className="absolute w-28 h-28 rounded-full bg-purple-500/20 animate-ping duration-1000" />
                <span className="absolute w-20 h-20 rounded-full bg-indigo-500/30 animate-pulse" />
              </>
            )}

            <button
              type="button"
              onClick={handleToggleRecord}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
                isRecording
                  ? "bg-rose-600 text-white shadow-rose-500/30 scale-105"
                  : "bg-indigo-600 text-white shadow-indigo-500/30"
              }`}
            >
              {isRecording ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Audio Wave Visualizer Bars */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1 h-8">
            {[40, 75, 100, 60, 90, 45, 80, 100, 65, 95, 50, 85].map((h, i) => (
              <span
                key={i}
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.6 + (i % 4) * 0.2}s`,
                }}
                className="w-1 rounded-full bg-gradient-to-t from-indigo-600 to-purple-500 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Live Transcription Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-left min-h-24 max-h-36 overflow-y-auto">
          {currentDisplayText ? (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
              {currentDisplayText}
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              Say something like: "Plan a 7-day culinary tour in Kyoto with a $5,000 budget and private tea ceremony..."
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleConfirmAndSend(false)}
            disabled={!currentDisplayText}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            Insert into Input
          </button>

          <button
            type="button"
            onClick={() => handleConfirmAndSend(true)}
            disabled={!currentDisplayText}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
