// src/components/TypewriterText.jsx
import React, { useState, useEffect } from 'react';

export default function TypewriterText({ text = '', speed = 14, onComplete, className = '' }) {
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    setDisplayedLength(0);
    if (!text) {
      if (onComplete) onComplete();
      return;
    }

    const interval = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + 1;
        if (next >= text.length) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return text.length;
        }
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  const isDone = displayedLength >= (text ? text.length : 0);

  return (
    <span className={className}>
      {text.slice(0, displayedLength)}
      {!isDone && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-emerald-400 animate-pulse align-middle" />
      )}
    </span>
  );
}
