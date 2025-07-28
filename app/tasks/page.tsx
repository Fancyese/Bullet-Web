'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Task = {
  id: string;
  content: string;
  status: string;
  assigned_to?: string;
  due_date?: string;
};

/* 符号 → 中文含义 */
const STATUS_LABEL: Record<string, string> = {
  '·': '待办',
  DOING: '进行中',
  '×': '已完成',
  '@': '已分配',
  '~': '已取消',
};

/* 点击循环：· → DOING → × → · */
const nextStatus = (cur: string) => {
  const order = ['·', 'DOING', '×', '@', '~'];
  const idx = order.indexOf(cur);
  return order[(idx + 1) % order.length];
};

/* 显示用的短符号 */
const STATUS_ICON: Record<string, string> = {
  '·': '·',
  DOING: 'ING',
  '×': '×',
  '@': '/',
  '~': '~',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assignName, setAssignName] = useState('');
  const [user, setUser] = useState<unknown>(null);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('inserted_at', { ascending: true });
    setTasks(data || []);
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return alert('请先登录！');

    const match = newTask.match(/^(.+?)@(\S+)$/);
    const content = match ? match[1].trim() : newTask.trim();
    const assigned = match ? match[2].trim() : null;
    const status = assigned ? '@' : '·';

    await supabase.from('tasks').insert({
      content,
      assigned_to: assigned,
      status,
      user_id: data.user.id,
    });
    setNewTask('');
    fetchTasks();
  };

  const toggleStatus = async (id: string, cur: string) => {
    const next = nextStatus(cur);
    if (next === '@') {
      await supabase
        .from('tasks')
        .update({ status: '@', assigned_to: '' })
        .eq('id', id);
      setEditingId(id);
      setAssignName('');
    } else {
      await supabase
        .from('tasks')
        .update({ status: next, assigned_to: null })
        .eq('id', id);
      setEditingId(null);
    }
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  const saveAssign = async (id: string) => {
    await supabase.from('tasks').update({ assigned_to: assignName.trim() }).eq('id', id);
    setEditingId(null);
    fetchTasks();
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        location.href = '/login';
      } else {
        setUser(data.user);
        fetchTasks();
      }
    });
  }, []);

  if (!user) {
    return (
      <main className="p-6 text-center">
        <h1 className="text-xl mb-2">请先登录</h1>
        <Link href="/login">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">去登录</button>
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">今日任务</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border px-3 py-1 rounded"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="输入任务…"
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded"
          onClick={addTask}
        >
          添加
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 border-b pb-2">
            <span
              className="cursor-pointer text-xl font-mono w-8 text-center"
              onClick={() => toggleStatus(t.id, t.status)}
              title={STATUS_LABEL[t.status]}
            >
              {STATUS_ICON[t.status]}
            </span>
            <span
              className={t.status === '~' ? 'line-through text-gray-400 flex-1' : 'flex-1'}
            >
              {t.content}
            </span>
            {t.status === '@' && editingId === t.id && (
              <input
                className="border px-2 rounded w-20 text-sm"
                value={assignName}
                onChange={(e) => setAssignName(e.target.value)}
                onBlur={() => saveAssign(t.id)}
                onKeyDown={(e) => e.key === 'Enter' && saveAssign(t.id)}
                placeholder="人名"
                autoFocus
              />
            )}
            {t.status === '@' && editingId !== t.id && t.assigned_to && (
              <span className="text-sm text-indigo-500">@{t.assigned_to}</span>
            )}
            <button
              className="text-red-500 text-sm ml-auto"
              onClick={() => deleteTask(t.id)}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}