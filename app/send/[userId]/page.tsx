'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { use } from 'react';

interface UserInfo {
  userName: string;
}

interface PageParams {
  userId: string;
}

const FLOATING_ICONS_COUNT = 20;

export default function SendMessage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recipientName, setRecipientName] = useState<string>('المستخدم');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get<{ success: boolean; 'Your Profile': UserInfo }>(`/user/getUser/${resolvedParams.userId}`);
        if (response.data?.data?.userName) {
          setRecipientName(response.data?.data?.userName);
        }
      } catch (err) {
        console.error('Failed to fetch recipient info:', err);
      }
    };

    fetchUserInfo();
  }, [resolvedParams.userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.put(`/message/${resolvedParams.userId}`, { content: message });
      setSuccess(true);
      setMessage('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send message');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 relative overflow-hidden">
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

      <div className="max-w-2xl mx-auto relative">
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-8 rtl:space-x-reverse">
            <motion.i 
              className="fas fa-user-secret text-4xl text-purple-300"
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
            <h1 className="text-2xl font-bold text-white text-right">
              أرسل رسالة مجهولة إلى {recipientName}
            </h1>
          </div>
          
          {error && (
            <motion.div 
              className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <i className="fas fa-exclamation-circle" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div 
              className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-xl mb-6"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <i className="fas fa-check-circle" />
                <p>تم إرسال رسالتك بنجاح!</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="message" 
                className="block text-lg font-medium text-white mb-2 text-right"
              >
                رسالتك
              </label>
              <div className="relative">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[200px] text-white placeholder-white/50 text-right"
                  placeholder="اكتب رسالتك المجهولة هنا..."
                  disabled={isLoading}
                  dir="rtl"
                />
                <motion.i 
                  className="fas fa-pen absolute top-4 left-4 text-white/50"
                  animate={{ 
                    rotate: message ? 45 : 0,
                    scale: message ? 1.1 : 1
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
              disabled={!message.trim() || isLoading}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <motion.i
                    className="fas fa-circle-notch"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane" />
                  <span>إرسال الرسالة</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}