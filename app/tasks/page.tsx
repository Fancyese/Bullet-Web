'use client';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

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

const STATUS_LABEL: Record<string, string> = {
  '·': '待办',
  DOING: '进行中',
  '×': '已完成',
  '@': '已分配',
  '~': '已取消',
};

const nextStatus = (cur: string) => {
  const order = ['·', 'DOING', '×', '@', '~'];
  const idx = order.indexOf(cur);
  return order[(idx + 1) % order.length];
};

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('inserted_at', { ascending: true });
    if (error) {
      alert('获取任务失败: ' + error.message);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setLoading(false);
      return alert('请先登录！');
    }

    const match = newTask.match(/^(.+?)@(\S+)$/);
    const content = match ? match[1].trim() : newTask.trim();
    const assigned = match ? match[2].trim() : null;
    const status = assigned ? '@' : '·';

    const { error } = await supabase.from('tasks').insert({
      content,
      assigned_to: assigned,
      status,
      user_id: data.user.id,
    });
    if (error) {
      alert('添加任务失败: ' + error.message);
    } else {
      setNewTask('');
      fetchTasks();
    }
    setLoading(false);
  };

  const toggleStatus = async (id: string, cur: string) => {
    setLoading(true);
    const next = nextStatus(cur);
    if (next === '@') {
      await supabase.from('tasks').update({ status: '@', assigned_to: '' }).eq('id', id);
      setEditingId(id);
      setAssignName('');
    } else {
      await supabase.from('tasks').update({ status: next, assigned_to: null }).eq('id', id);
      setEditingId(null);
    }
    await fetchTasks();
    setLoading(false);
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    await supabase.from('tasks').delete().eq('id', id);
    await fetchTasks();
    setLoading(false);
  };

  const saveAssign = async (id: string) => {
    setLoading(true);
    await supabase.from('tasks').update({ assigned_to: assignName.trim() }).eq('id', id);
    setEditingId(null);
    await fetchTasks();
    setLoading(false);
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
        <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
          去登录
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      {/* 内页导航按钮 */}
      <nav className="flex flex-wrap gap-3 justify-center mb-4">
        {[
          { label: '周视图', href: '/week', color: 'bg-purple-600 hover:bg-purple-700' },
          { label: '月视图', href: '/month', color: 'bg-indigo-600 hover:bg-indigo-700' },
          { label: '季视图', href: '/quarter', color: 'bg-teal-600 hover:bg-teal-700' },
          { label: '年视图', href: '/year', color: 'bg-green-600 hover:bg-green-700' },
          { label: '任务列表', href: '/tasks', color: 'bg-blue-600 hover:bg-blue-700' },
          { label: '项目预览', href: '/projects', color: 'bg-gray-600 hover:bg-gray-700' },
        ].map(({ label, href, color }) => (
          <Link
            key={href}
            href={href}
            className={`${color} text-white px-4 py-2 rounded-md font-medium transition`}
            aria-label={label}
          >
            {label}
          </Link>
        ))}
      </nav>

      <h1 className="text-3xl font-bold mb-4">今日任务</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="输入任务，格式示例：买菜 @张三"
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          disabled={loading}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded transition disabled:opacity-50"
          onClick={addTask}
          disabled={loading}
        >
          添加
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">加载中...</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500">暂无任务</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 border-b border-gray-200 pb-2"
            >
              <span
                role="button"
                tabIndex={0}
                className="cursor-pointer select-none text-xl font-mono w-8 text-center"
                onClick={() => toggleStatus(t.id, t.status)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') toggleStatus(t.id, t.status);
                }}
                title={STATUS_LABEL[t.status]}
                aria-label={`切换任务状态，当前状态：${STATUS_LABEL[t.status]}`}
              >
                {STATUS_ICON[t.status]}
              </span>

              <span
                className={`flex-1 ${
                  t.status === '~' ? 'line-through text-gray-400' : ''
                }`}
              >
                {t.content}
              </span>

              {t.status === '@' && editingId === t.id && (
                <input
                  className="border border-gray-300 rounded w-24 text-sm px-2 py-1"
                  value={assignName}
                  onChange={(e) => setAssignName(e.target.value)}
                  onBlur={() => saveAssign(t.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveAssign(t.id)}
                  placeholder="指派人名"
                  autoFocus
                  disabled={loading}
                />
              )}

              {t.status === '@' && editingId !== t.id && t.assigned_to && (
                <span className="text-indigo-600 text-sm select-none">
                  @{t.assigned_to}
                </span>
              )}

              <button
                className="text-red-500 text-sm ml-auto hover:underline focus:outline-none"
                onClick={() => deleteTask(t.id)}
                aria-label="删除任务"
                disabled={loading}
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
