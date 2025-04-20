'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { Message } from '../types/message';

interface Props {
  message: Message;
  onClick: () => void;
  prefersReducedMotion: boolean;
}

// Custom SVG for Closed Envelope
const ClosedEnvelope = () => (
  <svg width="80" height="80" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="closed-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#dbeafe', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="1.5" dy="1.5" stdDeviation="3" floodOpacity="0.5" />
      </filter>
      <pattern id="stitch" width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 3h6M3 0v6" stroke="#9ca3af" strokeWidth="0.7" />
      </pattern>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feBlend mode="multiply" in="SourceGraphic" />
      </filter>
    </defs>
    {/* Envelope Body */}
    <rect x="1" y="1" width="42" height="34" rx="6" fill="url(#closed-grad)" filter="url(#shadow)" />
    {/* Creases */}
    <path
      d="M1 14L22 20L43 14"
      stroke="#d4d4d4"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.6"
    />
    {/* Sealed Flap */}
    <path
      d="M1 14L22 2L43 14L43 2L1 2L1 14Z"
      fill="#dc2626"
      stroke="#991b1b"
      strokeWidth="0.9"
      fillOpacity="0.95"
      filter="url(#grain)"
    />
    {/* Seams */}
    <rect x="1" y="1" width="42" height="34" fill="url(#stitch)" opacity="0.5" />
    {/* Edge Curl */}
    <path
      d="M1 1L3 3H41L43 1"
      fill="none"
      stroke="#d4d4d4"
      strokeWidth="0.5"
      opacity="0.4"
    />
  </svg>
);

// Custom SVG for Open Envelope
const OpenEnvelope = () => (
  <svg width="80" height="80" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="open-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#dbeafe', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="1.5" dy="1.5" stdDeviation="3" floodOpacity="0.5" />
      </filter>
      <pattern id="stitch" width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 3h6M3 0v6" stroke="#9ca3af" strokeWidth="0.7" />
      </pattern>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feBlend mode="multiply" in="SourceGraphic" />
      </filter>
      <filter id="crumple">
        <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="2" />
        <feDisplacementMap in="SourceGraphic" scale="2" />
      </filter>
    </defs>
    {/* Envelope Body */}
    <rect x="1" y="1" width="42" height="34" rx="6" fill="url(#open-grad)" filter="url(#shadow)" />
    {/* Creases */}
    <path
      d="M1 14L22 20L43 14"
      stroke="#d4d4d4"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.6"
    />
    {/* Torn Flap with Jagged Edges */}
    <path
      d="M1 14L5 10L10 12L15 9L20 11L25 8L30 12L35 10L40 12L43 14L43 2L22 10L1 2L1 14Z"
      fill="#dc2626"
      stroke="#991b1b"
      strokeWidth="0.9"
      fillOpacity="0.95"
      filter="url(#grain)"
    />
    {/* Crumpled Effect */}
    <rect x="1" y="1" width="42" height="34" fill="url(#stitch)" opacity="0.5" filter="url(#crumple)" />
    {/* Torn Creases */}
    <path
      d="M5 10L10 12M15 9L20 11M25 8L30 12"
      stroke="#991b1b"
      strokeWidth="0.5"
      opacity="0.7"
    />
  </svg>
);

// Wax Seal SVG for Unread Messages
const WaxSeal = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="seal-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#b91c1c', stopOpacity: 1 }} />
      </radialGradient>
      <filter id="seal-shadow">
        <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.6" />
      </filter>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#seal-grad)" filter="url(#seal-shadow)" />
    <path
      d="M12 8L14 12L12 16L10 12L12 8Z"
      fill="#fef2f2"
      stroke="#7f1d1d"
      strokeWidth="1.2"
    />
    <path
      d="M9 9L15 15M9 15L15 9"
      stroke="#7f1d1d"
      strokeWidth="1"
      opacity="0.9"
    />
  </svg>
);

// Stamp SVG for Unread Messages
const Stamp = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="2" fill="#2563eb" />
    <path
      d="M6 6H18V18H6V6Z"
      fill="none"
      stroke="#dbeafe"
      strokeWidth="1"
    />
    <text x="12" y="14" fontSize="6" fill="#dbeafe" textAnchor="middle" fontFamily="Caveat">New</text>
  </svg>
);

export default function MessageEnvelope({ message, onClick, prefersReducedMotion }: Props) {
  const [isRead, setIsRead] = useState(message.read);
  const formattedDate = format(new Date(message.date), 'MMM d, yyyy');

  const handleEnvelopeClick = () => {
    if (!isRead) {
      setIsRead(true);
      onClick();
    }
  };

  return (
    <motion.div
      className="relative w-full max-w-md rounded-3xl bg-cream-50 cursor-pointer overflow-hidden border border-gray-400 hover:shadow-4xl"
      style={{
        fontFamily: '"Caveat", Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")',
        backgroundSize: '340px 340px',
      }}
      whileHover={prefersReducedMotion ? {} : {
        scale: 1.15,
        boxShadow: '0 20px 48px rgba(37, 99, 235, 0.35)',
        rotate: 2.5,
      }}
      whileTap={prefersReducedMotion ? {} : {
        scale: 0.85,
        y: 10,
      }}
      animate={{
        boxShadow: isRead ? '0 6px 16px rgba(0, 0, 0, 0.12)' : '0 12px 32px rgba(239, 68, 68, 0.25)',
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.8,
        ease: [0.68, -0.55, 0.265, 1.55],
      }}
      onClick={handleEnvelopeClick}
      layout
      role="button"
      tabIndex={0}
      aria-label={`Message from ${formattedDate}, ${isRead ? 'read' : 'unread'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleEnvelopeClick();
        }
      }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream-50/90 to-blue-50/90" />
      
      {/* Envelope Content */}
      <motion.div
        className="relative flex flex-col items-center justify-center p-12 h-72"
        initial={false}
        animate={{
          backgroundColor: isRead ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.25)',
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
      >
        {/* Slide-Out Paper Effect */}
        <AnimatePresence>
          {!isRead && (
            <motion.div
              className="absolute inset-x-0 top-0 h-16 bg-white/95 border-b-2 border-gray-300 shadow-md"
              style={{ borderRadius: '0 0 10px 10px' }}
              initial={{ y: 0, opacity: 0, rotate: 0 }}
              animate={{
                y: -80,
                opacity: 1,
                rotate: 4,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
              }}
              exit={{ y: -160, opacity: 0, rotate: 8 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 1.4,
                ease: 'easeOut',
                delay: prefersReducedMotion ? 0 : 0.5,
              }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        <motion.div
          className="flex items-center justify-center mb-6"
          initial={false}
          animate={{
            scale: isRead ? 0.78 : 1,
            rotate: isRead ? 15 : 0,
            opacity: isRead ? 0.55 : 1,
            y: isRead ? 12 : 0,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.8,
            ease: [0.68, -0.55, 0.265, 1.55],
            scale: {
              duration: prefersReducedMotion ? 0 : 1.8,
              times: [0, 0.3, 0.6, 1],
              values: isRead ? [1, 0.9, 0.78, 0.78] : [1, 1, 1, 1],
            },
          }}
        >
          {isRead ? (
            <OpenEnvelope />
          ) : (
            <ClosedEnvelope />
          )}
        </motion.div>
        <motion.div
          className="text-xl font-medium text-blue-900 tracking-tight"
          style={{ textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)' }}
          animate={{ color: isRead ? '#1e3a8a' : '#1e40af' }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          {formattedDate}
        </motion.div>
        <motion.div
          className="absolute bottom-6 right-6"
          initial={false}
          animate={{
            opacity: isRead ? 0 : 1,
            scale: isRead ? [1, 0.9, 0.3, 0] : 1,
            rotate: isRead ? -90 : 0,
            x: isRead ? [0, 20, -20, 0] : 0,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.6,
            ease: 'easeInOut',
            scale: {
              duration: prefersReducedMotion ? 0 : 1.6,
              times: [0, 0.3, 0.6, 1],
              values: isRead ? [1, 0.9, 0.3, 0] : [1, 1, 1, 1],
            },
          }}
          aria-hidden="true"
        >
          <WaxSeal />
        </motion.div>
        <motion.div
          className="absolute top-6 right-6"
          initial={false}
          animate={{
            opacity: isRead ? 0 : 1,
            scale: isRead ? [1, 0.8, 0.3, 0] : 1,
            rotate: isRead ? 45 : 0,
            y: isRead ? [0, 15, -15, 0] : 0,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.6,
            ease: 'easeInOut',
            scale: {
              duration: prefersReducedMotion ? 0 : 1.6,
              times: [0, 0.3, 0.6, 1],
              values: isRead ? [1, 0.8, 0.3, 0] : [1, 1, 1, 1],
            },
          }}
          aria-hidden="true"
        >
          <Stamp />
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 