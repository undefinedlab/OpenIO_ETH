'use client';

import { useEffect, useRef, useState } from 'react';

interface DecoderTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function DecoderText({ text, className = '', delay = 0 }: DecoderTextProps) {
  const [displayText, setDisplayText] = useState<string[]>([]);
  const [isDecoding, setIsDecoding] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_-+=[]{}|;:,.<>?';
  const originalChars = text.split('');

  useEffect(() => {
    // Initialize with random characters
    setDisplayText(originalChars.map(() => chars[Math.floor(Math.random() * chars.length)]));
    setIsDecoding(true);
    startTimeRef.current = Date.now();

    const startDecoding = () => {
      const startDelay = delay * 1000;
      
      setTimeout(() => {
        const duration = 1000; // 1 second total
        const charDelay = duration / originalChars.length;
        let currentIndex = 0;

        intervalRef.current = setInterval(() => {
          setDisplayText(prev => {
            const newText = [...prev];
            
            // Decode characters one by one
            if (currentIndex < originalChars.length) {
              for (let i = 0; i <= currentIndex; i++) {
                if (i === currentIndex) {
                  // Current character cycles through random chars
                  newText[i] = chars[Math.floor(Math.random() * chars.length)];
                } else if (i < currentIndex) {
                  // Already decoded characters stay as original
                  newText[i] = originalChars[i];
                }
              }
              currentIndex++;
            } else {
              // All decoded, set final text
              setIsDecoding(false);
              return originalChars;
            }
            
            return newText;
          });
        }, charDelay);

        // Clean up after duration
        setTimeout(() => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setDisplayText(originalChars);
          setIsDecoding(false);
        }, duration);
      }, startDelay);
    };

    startDecoding();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, delay]);

  return (
    <span className={`decoder-text ${className} ${isDecoding ? 'decoding' : ''}`}>
      {displayText.map((char, i) => (
        <span key={i} className="decoder-char">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

