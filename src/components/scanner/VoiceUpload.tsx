'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

interface VoiceUploadProps {
  audioFile: File | null;
  onFileChange: (file: File | null) => void;
}

export default function VoiceUpload({ audioFile, onFileChange }: VoiceUploadProps) {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioUrl = audioFile ? URL.createObjectURL(audioFile) : null;

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|webm|ogg)$/i))) {
      onFileChange(file);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => audioInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl p-6 sm:p-8 text-center cursor-pointer hover:border-primary/30 hover:bg-card transition-all active:scale-[0.99]"
      >
        {audioFile ? (
          <div className="space-y-4">
            <div className="text-3xl sm:text-4xl">🎙️</div>
            <p className="text-sm font-medium text-foreground/80 break-all px-2">{audioFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
            </p>

            {/* Audio waveform visualization */}
            <div className="flex items-center justify-center gap-[3px] h-12 px-4">
              {Array.from({ length: 28 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-blue-500 to-cyan-400"
                  animate={{
                    height: [
                      `${6 + Math.sin(i * 0.5) * 16 + Math.random() * 8}px`,
                      `${6 + Math.cos(i * 0.7) * 16 + Math.random() * 8}px`,
                      `${6 + Math.sin(i * 0.5) * 16 + Math.random() * 8}px`,
                    ],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: i * 0.04,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {audioUrl && (
              <audio
                src={audioUrl}
                controls
                className="w-full max-w-xs mx-auto mt-2 h-10"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <p className="text-xs text-muted-foreground">Klik untuk ganti audio</p>
          </div>
        ) : (
          <>
            <div className="text-3xl sm:text-4xl mb-3">🎙️</div>
            <p className="text-xs sm:text-sm text-foreground/80 mb-1">
              Upload voice note atau rekaman panggilan
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">
              MP3, WAV, M4A, WEBM (maks 25MB)
            </p>
            {/* Decorative idle waveform */}
            <div className="flex items-center justify-center gap-[3px] h-8 px-8 opacity-30">
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full bg-muted-foreground"
                  animate={{ height: [`${4 + Math.sin(i * 0.8) * 6}px`, `${4 + Math.cos(i * 0.6) * 6}px`] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <input
        ref={audioInputRef}
        type="file"
        accept="audio/mp3,audio/wav,audio/m4a,audio/webm,audio/mpeg,audio/x-m4a,audio/ogg,.mp3,.wav,.m4a,.webm"
        onChange={handleAudioChange}
        className="hidden"
      />

      {/* Voice detection info */}
      <div className="p-3 rounded-xl bg-blue-500/[0.04] border border-blue-500/10">
        <p className="text-xs text-blue-300/70 leading-relaxed">
          🎙️ <strong className="text-blue-300/90">Voice Scam Detection:</strong>{' '}
          AI akan mentranskripsi audio dan menganalisis pola manipulasi suara seperti tekanan urgensi, otoritas palsu, dan teknik kepanikan.
        </p>
      </div>
    </div>
  );
}
