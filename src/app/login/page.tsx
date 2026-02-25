'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chrome, Zap, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!isLogin) {
        // Signup flow
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Signup failed');
          setIsLoading(false);
          return;
        }

        // Auto-login after signup
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Account created, please login');
          setIsLogin(true);
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        // Login flow
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Invalid email or password');
        } else {
          router.push('/');
          router.refresh();
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0000FF] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF00FF] rounded-full blur-[120px]"></div>
      </div>

      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-20">
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="appearance-none bg-[#111] border border-[#333] text-white px-4 py-2 pr-10 rounded-lg cursor-pointer hover:border-[#00FFFF] transition-colors font-mono text-sm"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-[#111] border-2 border-[#00FFFF] shadow-[0_0_40px_rgba(0,255,255,0.2)] relative z-10 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4 border border-[#BEF754] shadow-[0_0_15px_#BEF754]">
            <Zap className="text-[#BEF754]" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white">{t(isLogin ? 'login.title' : 'signup.title')}</h2>
          <p className="text-gray-500 font-mono text-sm mt-2">
            {t(isLogin ? 'login.subtitle' : 'signup.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-400">{t('signup.fullname')}</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#000] border-[#222] text-white focus:border-[#00FFFF]"
                placeholder="Alex Hunter"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-400">{t('signup.email')}</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#000] border-[#222] text-white focus:border-[#00FFFF]"
              placeholder="hunter@hydrahunt.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">{t('signup.password')}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#000] border-[#222] text-white focus:border-[#00FFFF]"
              placeholder="•••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-400">{t('signup.confirm_password')}</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[#000] border-[#222] text-white focus:border-[#00FFFF]"
                placeholder="•••••••••"
                required
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-lg mt-4 bg-[#0000FF] border-[#00FFFF] hover:bg-white hover:text-black hover:shadow-[0_0_20px_#fff]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                {isLogin ? t('login.magic_link') : t('signup.create')}{' '}
                <ArrowRight className="inline ml-2" size={18} />
              </>
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-[1px] bg-[#333] flex-1"></div>
          <span className="text-xs font-bold text-gray-500">{t('login.or')}</span>
          <div className="h-[1px] bg-[#333] flex-1"></div>
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            variant="ghost"
            className="w-full border border-[#333] text-gray-300 hover:border-white hover:bg-white hover:text-black flex items-center justify-center gap-2"
          >
            <Chrome size={18} /> {t('login.google')}
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? (
            <>
              {t('login.no_account')}{' '}
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className="text-[#00FFFF] hover:underline font-bold"
              >
                {t('login.signup')}
              </button>
            </>
          ) : (
            <>
              {t('login.have_account')}{' '}
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className="text-[#00FFFF] hover:underline font-bold"
              >
                {t('login.signin')}
              </button>
            </>
          )}
        </div>

        {!isLogin && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            {t('signup.terms')}
          </div>
        )}
      </div>
    </div>
  );
}
