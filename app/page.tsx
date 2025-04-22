'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import api from './lib/axios';
import SuccessPopup from './components/SuccessPopup';

interface SignupData {
  userName: string;
  email: string;
  password: string;
  phone: string;
  DOB: string;
  gender: 'male' | 'female';
}

interface ValidationErrors {
  userName?: string;
  email?: string;
  password?: string;
  phone?: string;
  DOB?: string;
}

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [signupData, setSignupData] = useState<SignupData>({
    userName: '',
    email: '',
    password: '',
    phone: '',
    DOB: '',
    gender: 'male'
  });
  const [signupErrors, setSignupErrors] = useState<ValidationErrors>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('success');
  const { login, isLoading, error } = useAuth();

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+201|01)[0-2,5]{1}[0-9]{8}$/;
    if (!phone) {
      return 'Phone number is required';
    }
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid Egyptian phone number';
    }
    return '';
  };

  const validateUserName = (userName: string) => {
    if (!userName) {
      return 'Username is required';
    }
    if (userName.length < 2) {
      return 'Username must be at least 2 characters long';
    }
    if (userName.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9]+$/.test(userName)) {
      return 'Username can only contain letters and numbers';
    }
    return '';
  };

  const validateDOB = (dob: string) => {
    if (!dob) {
      return 'Date of birth is required';
    }
    const dobDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    if (age < 13) {
      return 'You must be at least 13 years old';
    }
    return '';
  };

  const validateSignupForm = () => {
    const errors: ValidationErrors = {};
    errors.userName = validateUserName(signupData.userName);
    errors.email = validateEmail(signupData.email);
    errors.password = validatePassword(signupData.password);
    errors.phone = validatePhone(signupData.phone);
    errors.DOB = validateDOB(signupData.DOB);

    setSignupErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    setIsLoggingIn(true);
    const result = await login({ email, password });
    if (result?.requiresEmailActivation) {
      showNotification('Email Created but Active Your Email From Message Gmail First', 'info');
    }
    setIsLoggingIn(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }

    setIsLoggingIn(true);
    setSignupError(null);

    try {
      await api.post('/users/signup', signupData);
      showNotification('Email Created but Active Your Email From Message Gmail First', 'info');
      setIsLogin(true);
      setEmail(signupData.email);
      setPassword(signupData.password);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error?.[0]?.message || 'Signup failed';
      setSignupError(errorMessage.replace(/['"]/g, ''));
      showNotification(errorMessage.replace(/['"]/g, ''), 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignupInputChange = (field: keyof SignupData, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    
    let error = '';
    switch (field) {
      case 'userName':
        error = validateUserName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'DOB':
        error = validateDOB(value);
        break;
    }
    
    setSignupErrors(prev => ({ ...prev, [field]: error }));
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-gray-900 to-gray-800"
      style={{
        backgroundImage: `
          linear-gradient(rgba(17, 24, 39, 0.9), rgba(17, 24, 39, 0.9)),
          url('https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2000&auto=format&fit=crop')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <SuccessPopup
        message={popupMessage}
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        type={popupType}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[10%] text-white/20 text-6xl">
          <i className="fas fa-user-secret"></i>
        </div>
        <div className="absolute top-[40%] right-[5%] text-white/10 text-8xl">
          <i className="fas fa-mask"></i>
        </div>
        <div className="absolute bottom-[20%] left-[15%] text-white/15 text-7xl">
          <i className="fas fa-user-ninja"></i>
        </div>
      </div>

      <motion.div 
        className="relative w-[380px] backdrop-blur-lg bg-white/10 rounded-2xl overflow-hidden border border-white/20"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-indigo-900/50" />
        
        <div className="relative z-10 p-8">
          <div className="flex justify-center mb-8">
            <motion.div 
              className="text-5xl text-white/90 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <i className="fas fa-user-secret"></i>
            </motion.div>
          </div>

          <motion.div 
            className="flex justify-center mb-8 bg-white/5 p-2 rounded-xl backdrop-blur-sm"
            layout
          >
            <motion.button
              onClick={() => setIsLogin(true)}
              className={`px-6 py-2.5 rounded-lg transition-all duration-300 relative ${
                isLogin ? 'bg-white text-purple-900 font-semibold' : 'text-white/80 hover:text-white'
              }`}
              whileHover={{ scale: isLogin ? 1 : 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
              {isLogin && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-lg -z-10"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
            <motion.button
              onClick={() => setIsLogin(false)}
              className={`px-6 py-2.5 rounded-lg transition-all duration-300 relative ${
                !isLogin ? 'bg-white text-purple-900 font-semibold' : 'text-white/80 hover:text-white'
              }`}
              whileHover={{ scale: !isLogin ? 1 : 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Up
              {!isLogin && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-lg -z-10"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          </motion.div>

          <AnimatePresence mode="wait">
            {(error || signupError) && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm text-center"
              >
                {error || signupError}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleLogin}
                className="space-y-6"
              >
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <i className="fas fa-user absolute top-3 left-4 text-white/60"></i>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(validateEmail(e.target.value));
                    }}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-11 py-3 text-white placeholder-white/40 focus:border-white/20 focus:outline-none transition-all duration-300"
                    placeholder="Email"
                    disabled={isLoading || isLoggingIn}
                  />
                  {emailError && (
                    <p className="mt-1 text-red-400 text-sm">{emailError}</p>
                  )}
                </motion.div>
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <i className="fas fa-lock absolute top-3 left-4 text-white/60"></i>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(validatePassword(e.target.value));
                    }}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-11 py-3 text-white placeholder-white/40 focus:border-white/20 focus:outline-none transition-all duration-300"
                    placeholder="Password"
                    disabled={isLoading || isLoggingIn}
                  />
                  {passwordError && (
                    <p className="mt-1 text-red-400 text-sm">{passwordError}</p>
                  )}
                </motion.div>
                <motion.button 
                  className="w-full bg-white text-purple-900 py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || isLoggingIn || !!emailError || !!passwordError}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {(isLoading || isLoggingIn) ? (
                    <motion.i
                      className="fas fa-circle-notch text-xl"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <span>Login Now</span>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSignup}
                className="space-y-4"
              >
                {[
                  { icon: "user", placeholder: "Username", type: "text", key: "userName" },
                  { icon: "envelope", placeholder: "Email", type: "email", key: "email" },
                  { icon: "lock", placeholder: "Password", type: "password", key: "password" },
                  { icon: "phone", placeholder: "Phone (e.g., +201234567890)", type: "tel", key: "phone" }
                ].map((field, index) => (
                  <motion.div 
                    key={field.key}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <i className={`fas fa-${field.icon} absolute top-3 left-4 text-white/60`}></i>
                    <input 
                      type={field.type}
                      value={signupData[field.key as keyof SignupData]}
                      onChange={(e) => handleSignupInputChange(field.key as keyof SignupData, e.target.value)}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-11 py-3 text-white placeholder-white/40 focus:border-white/20 focus:outline-none transition-all duration-300"
                      placeholder={field.placeholder}
                      disabled={isLoggingIn}
                    />
                    {signupErrors[field.key as keyof ValidationErrors] && (
                      <p className="mt-1 text-red-400 text-sm">{signupErrors[field.key as keyof ValidationErrors]}</p>
                    )}
                  </motion.div>
                ))}
                
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <i className="fas fa-calendar absolute top-3 left-4 text-white/60"></i>
                  <input 
                    type="date"
                    value={signupData.DOB}
                    onChange={(e) => handleSignupInputChange('DOB', e.target.value)}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-11 py-3 text-white placeholder-white/40 focus:border-white/20 focus:outline-none transition-all duration-300"
                    max={new Date().toISOString().split('T')[0]}
                    disabled={isLoggingIn}
                  />
                  {signupErrors.DOB && (
                    <p className="mt-1 text-red-400 text-sm">{signupErrors.DOB}</p>
                  )}
                </motion.div>

                <motion.div 
                  className="flex items-center justify-center space-x-6 py-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {['male', 'female'].map((gender) => (
                    <label key={gender} className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value={gender}
                        checked={signupData.gender === gender}
                        onChange={(e) => setSignupData({...signupData, gender: e.target.value as 'male' | 'female'})}
                        className="hidden"
                        disabled={isLoggingIn}
                      />
                      <motion.div 
                        className={`px-6 py-2 rounded-lg border-2 transition-all duration-300 ${
                          signupData.gender === gender 
                            ? 'bg-white text-purple-900 border-white' 
                            : 'border-white/20 text-white/60'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </motion.div>
                    </label>
                  ))}
                </motion.div>

                <motion.button 
                  className="w-full bg-white text-purple-900 py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoggingIn || Object.values(signupErrors).some(error => error !== '')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {isLoggingIn ? (
                    <motion.i
                      className="fas fa-circle-notch text-xl"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <span>Sign Up</span>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}