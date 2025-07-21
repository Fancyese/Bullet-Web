'use client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const signIn = async () => {
    const email = prompt('请输入邮箱');
    if (!email) return;
    await supabase.auth.signInWithOtp({ email });
    alert('请查看邮箱中的登录链接');
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