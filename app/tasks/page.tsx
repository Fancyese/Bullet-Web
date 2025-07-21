'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

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
  if (cur === '·') return 'DOING';
  if (cur === 'DOING') return '×';
  if (cur === '×') return '·';
  return '·';
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('inserted_at', { ascending: true });
    setTasks(data || []);
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert('请先登录！');
    await supabase.from('tasks').insert({
      content: newTask.trim(),
      user_id: user.id,
    });
    setNewTask('');
    fetchTasks();
  };

  const toggleStatus = async (id: string, cur: string) => {
    await supabase.from('tasks').update({ status: nextStatus(cur) }).eq('id', id);
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">今日任务</h1>

      {/* 新增任务 */}
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

      {/* 任务列表 */}
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 border-b pb-2"
          >
            {/* 状态符号 */}
            <span
              className="cursor-pointer text-xl font-mono w-6 text-center"
              onClick={() => toggleStatus(t.id, t.status)}
              title={STATUS_LABEL[t.status]}
            >
              {t.status}
            </span>

            {/* 内容 */}
            <span
              className={
                t.status === '~' ? 'line-through text-gray-400 flex-1' : 'flex-1'
              }
            >
              {t.content}
              {t.assigned_to && (
                <span className="ml-2 text-sm text-indigo-500">
                  @{t.assigned_to}
                </span>
              )}
            </span>

            {/* 截止日期 */}
            {t.due_date && (
              <span className="text-sm text-gray-500">
                {format(new Date(t.due_date), 'MM/dd')}
              </span>
            )}

            {/* 删除按钮 */}
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