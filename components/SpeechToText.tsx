'use client';
import { to } from '@utilities/tools';
import React, { useState, useRef, useEffect } from 'react';
import { Microphone, MicrophoneSlash } from '@phosphor-icons/react/dist/ssr';

// Type declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onend: () => void;
  onerror: any;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export const SpeechToTextInput = ({ lang, isBothHandsMic, listen, onListen, onText }: { lang: string; isBothHandsMic: boolean; listen: boolean; onListen: any; onText: any; }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const bufferLengthRef = useRef<number | null>(null);

  const startRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        let len = event.results.length;
        let latestTranscript = to.string(event?.results?.[len - 1]?.[0]?.transcript).trim().toLocaleLowerCase();
        onText(latestTranscript);
      };

      recognition.onend = () => {
        console.log('Speech recognition has stopped.');
        setIsListening(false);
        onListen(false);
        stopAudioProcessing();
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error detected: ' + event.error);
      };

      recognition.onnomatch = () => {
        console.log('Speech not recognized.');
      };

      recognition.onspeechend = () => {
        console.log('Speech has ended.');
      };

      recognition.onnomatch = () => {
        console.log('Speech not recognized.');
      };

      recognition.start();
      setIsListening(true);
      onListen(true);
      setupAudioProcessing();
    } else {
      console.log('Speech recognition not supported in this browser.');
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      onListen(false);
      stopAudioProcessing();
    }
  };

  const setupAudioProcessing = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        bufferLengthRef.current = bufferLength;

        draw();
      })
      .catch(err => {
        console.error('Error accessing audio stream: ', err);
      });
  };

  const stopAudioProcessing = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current || !bufferLengthRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const bufferLength = bufferLengthRef.current;

    if (ctx) {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 4;

      // Create the gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#d946ef');
      gradient.addColorStop(1, '#6366f1');
      ctx.strokeStyle = gradient;

      ctx.beginPath();
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
  };

  const onMicrophone = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    onListen(!isListening);
  };

  useEffect(() => {
    if (listen) startRecognition();
    else stopRecognition();
  }, [listen]);

  return (
    <div className="w-full h-full relative">

      {isListening ? null : isBothHandsMic ? (
        <div className="w-full flex justify-center pb-3">
          <div className="w-fit text-sm py-1 px-3 text-center font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-50 bg-white/80 dark:bg-slate-950/80 rounded-lg">
            Muéstrame tus manos 👋
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-center">
        <div className="group relative transition-transform duration-300 active:scale-95 z-10">
          <button onClick={onMicrophone} className="relative z-10 w-full rounded-full bg-gradient-to-br from-indigo-500/90 to-fuchsia-500/90 p-1 duration-300 group-hover:scale-110">
            <span className="block rounded-full p-2 sm:p-3 font-semibold duration-300 text-white group-hover:text-slate-50 bg-slate-950/40 dark:bg-slate-950/70">
              {isListening ? <Microphone weight="fill" className="size-6 sm:size-8 animate-pulse" /> :
                <MicrophoneSlash className="size-6 sm:size-8" />}
            </span>
          </button>
          <span className="pointer-events-none absolute -inset-4 z-0 transform-gpu rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-30 blur-xl transition-all duration-300 group-hover:opacity-90 group-active:opacity-50"></span>
        </div>
        <div className={isListening ? "absolute z-0 w-full flex justify-center" : "hidden"}>
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </div>
  );
};
