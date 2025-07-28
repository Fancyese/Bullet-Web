'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async () => {
    const email = prompt('请输入邮箱');
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert('登录失败，请重试: ' + error.message);
    } else {
      alert('已发送登录链接，请查收邮箱');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">子弹笔记登录</h1>
      <button
        onClick={signIn}
        className="px-6 py-2 bg-blue-500 text-white rounded"
      >
        邮箱登录 / 注册
      </button>
    </main>
  );
}
