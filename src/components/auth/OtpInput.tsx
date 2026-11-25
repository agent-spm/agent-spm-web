"use client";

import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Array of single-character strings for each slot
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, "");

    if (!cleanDigits) {
      // User cleared the box
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    if (cleanDigits.length > 1) {
      // User pasted or typed multiple digits
      const combined = (
        digits.slice(0, index).join("") +
        cleanDigits +
        digits.slice(index + 1).join("")
      ).slice(0, length);
      onChange(combined);
      const nextFocus = Math.min(combined.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    // Single digit typed
    const newDigits = [...digits];
    newDigits[index] = cleanDigits;
    const nextVal = newDigits.join("");
    onChange(nextVal);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move back to previous cell and clear it
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        e.preventDefault();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    if (!pasted) return;

    const trimmed = pasted.slice(0, length);
    onChange(trimmed);

    const focusIdx = Math.min(trimmed.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 my-3 max-w-[340px] mx-auto">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-full min-w-0 h-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-[8px] border border-black/15 bg-white text-black placeholder:text-black/20 focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none transition-all shadow-xs disabled:opacity-50 select-all"
          aria-label={`Digit ${i + 1} of verification code`}
        />
      ))}
    </div>
  );
}
