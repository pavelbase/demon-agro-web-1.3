"use client";

import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useRef } from 'react';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
}

/**
 * Cloudflare Turnstile CAPTCHA Widget
 * 
 * Ochrana proti botům na veřejných formulářích.
 * 
 * @param onSuccess - Callback volaný po úspěšné validaci (vrací token)
 * @param onError - Callback volaný při chybě
 */
export default function TurnstileWidget({ onSuccess, onError }: TurnstileWidgetProps) {
  const turnstileRef = useRef<TurnstileInstance>(null);
  
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.error('⚠️ Turnstile Site Key není nakonfigurován!');
    return (
      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
        ⚠️ Ochrana proti botům není nakonfigurována. Přidejte NEXT_PUBLIC_TURNSTILE_SITE_KEY do .env.local
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={() => {
          console.error('Turnstile error');
          if (onError) onError();
        }}
        onExpire={() => {
          console.warn('Turnstile token expired, refreshing...');
          turnstileRef.current?.reset();
        }}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  );
}


