'use client';
import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../types/message';
import { toPng } from 'html-to-image';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon
} from 'react-share';

interface Props {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  prefersReducedMotion: boolean;
}

export default function MessageModal({ message, isOpen, onClose, prefersReducedMotion }: Props) {
  const [isSharing, setIsSharing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [shareNotification, setShareNotification] = useState('');
  const messageRef = useRef<HTMLDivElement>(null);

  const generateImage = async () => {
    if (!messageRef.current) return;
    
    try {
      const dataUrl = await toPng(messageRef.current, {
        quality: 0.95,
        backgroundColor: '#1e1b4b'
      });
      
      setImageUrl(dataUrl);
      setIsSharing(true);
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const shareData = {
    url: typeof window !== 'undefined' ? window.location.href : '',
    title: 'Anonymous Message',
    hashtag: '#AnonymousMessage',
    quote: message?.content || '',
  };

  const handleShare = (platform: string) => {
    setShareNotification(`Opening ${platform}... You can now create a story or post with the generated image.`);
    setTimeout(() => setShareNotification(''), 3000);
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 p-6 text-left align-middle shadow-xl transition-all border border-white/20">
              <div ref={messageRef} className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <i className="fas fa-user-secret text-2xl text-purple-300" />
                  <Dialog.Title className="text-xl font-medium text-white">
                    Anonymous Message
                  </Dialog.Title>
                </div>
                
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-4"
                >
                  <p className="text-white/90 whitespace-pre-wrap">{message?.content}</p>
                </motion.div>
              </div>

              <AnimatePresence mode="wait">
                {shareNotification && (
                  <motion.div
                    key="notification"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-200 text-sm text-center"
                  >
                    {shareNotification}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {isSharing && imageUrl && (
                  <motion.div
                    key="share-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="border border-white/10 rounded-xl overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt="Message preview" 
                        className="w-full h-auto"
                      />
                    </div>
                    
                    <div className="border-t border-white/10 pt-4">
                      <h3 className="text-white text-sm font-medium mb-3 text-center">Share on Social Media</h3>
                      <div className="flex space-x-4 justify-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FacebookShareButton 
                            url={shareData.url}
                            quote={shareData.quote}
                            hashtag={shareData.hashtag}
                            onClick={() => handleShare('Facebook')}
                          >
                            <FacebookIcon size={40} round />
                          </FacebookShareButton>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TwitterShareButton
                            url={shareData.url}
                            title={shareData.quote}
                            hashtags={[shareData.hashtag.replace('#', '')]}
                            onClick={() => handleShare('Twitter')}
                          >
                            <TwitterIcon size={40} round />
                          </TwitterShareButton>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <WhatsappShareButton
                            url={shareData.url}
                            title={shareData.quote}
                            onClick={() => handleShare('WhatsApp')}
                          >
                            <WhatsappIcon size={40} round />
                          </WhatsappShareButton>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TelegramShareButton
                            url={shareData.url}
                            title={shareData.quote}
                            onClick={() => handleShare('Telegram')}
                          >
                            <TelegramIcon size={40} round />
                          </TelegramShareButton>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex justify-between">
                <motion.button
                  type="button"
                  className="inline-flex items-center space-x-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-6 py-3 text-sm font-medium text-purple-300 hover:bg-purple-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                  onClick={generateImage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-share-alt" />
                  <span>Share</span>
                </motion.button>

                <motion.button
                  type="button"
                  className="inline-flex items-center space-x-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-times" />
                  <span>Close</span>
                </motion.button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}