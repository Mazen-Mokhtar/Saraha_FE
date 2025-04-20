'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MessageEnvelope from '../components/MessageEnvelope';
import MessageModal from '../components/MessageModal';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/axios';
import type { Message, MessageResponse, UnreadCountResponse } from '../types/message';
import { jwtDecode } from 'jwt-decode';

const FLOATING_ICONS_COUNT = 20;

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    setIsClient(true);
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.userId;
        setShareableLink(`${window.location.origin}/send/${userId}`);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }

    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get<MessageResponse>('/message/user-messages');
      const fetchedMessages = response.data.allMessage || [];
      const validMessages = fetchedMessages
        .filter((msg) => msg._id)
        .map((msg) => ({ ...msg, id: msg._id.toString() }));
      setMessages(validMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get<UnreadCountResponse>('/message/count-message');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);

    if (!message.read) {
      try {
        await api.patch(`/message/markRead/${message._id}`);
        await fetchMessages();
        await fetchUnreadCount();
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const getRandomPosition = useCallback((index: number) => {
    if (!isClient) return { x: 0, y: 0, scale: 1, fontSize: 16, opacity: 0.5 };
    
    const seed = index / FLOATING_ICONS_COUNT;
    return {
      x: window.innerWidth * seed,
      y: -20,
      scale: 0.5 + (seed * 0.5),
      fontSize: 10 + (seed * 20),
      opacity: 0.2 + (seed * 0.4)
    };
  }, [isClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {isClient && [...Array(FLOATING_ICONS_COUNT)].map((_, i) => {
            const position = getRandomPosition(i);
            return (
              <motion.i
                key={`floating-icon-${i}`}
                className="fas fa-user-secret text-white absolute"
                initial={{ 
                  x: position.x,
                  y: position.y,
                  scale: position.scale
                }}
                animate={{
                  y: isClient ? window.innerHeight + 20 : 0,
                  rotate: 360
                }}
                transition={{
                  duration: 10 + (i * 0.5),
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  fontSize: `${position.fontSize}px`,
                  opacity: position.opacity
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <motion.i 
              className="fas fa-user-secret text-4xl text-white"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <h1 className="text-3xl font-bold text-white">Your Anonymous Messages</h1>
          </div>
          <motion.button
            onClick={logout}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-sign-out-alt" />
            <span>Logout</span>
          </motion.button>
        </div>

        {/* Share Link Section */}
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <i className="fas fa-share-alt text-2xl text-purple-300" />
            <h2 className="text-2xl font-semibold text-white">Share Your Anonymous Link</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <input
                type="text"
                readOnly
                value={shareableLink}
                className="w-full p-4 bg-transparent text-white placeholder-white/50 focus:outline-none"
              />
            </div>
            <CopyToClipboard
              text={shareableLink}
              onCopy={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              <motion.button 
                className="px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`} />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </motion.button>
            </CopyToClipboard>
          </div>
        </motion.div>

        {/* Messages Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-4xl text-white"
            >
              <i className="fas fa-circle-notch" />
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.length > 0 ? (
              messages.map((message, index) => {
                if (!message || !message._id) {
                  return null;
                }
                return (
                  <MessageEnvelope
                    key={message._id || `message-${index}`}
                    message={message}
                    onClick={() => handleMessageClick(message)}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center h-64 text-white/70">
                <i className="fas fa-inbox text-6xl mb-4" />
                <p className="text-xl">No messages yet</p>
              </div>
            )}
          </div>
        )}

        <MessageModal
          message={selectedMessage}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    </div>
  );
}