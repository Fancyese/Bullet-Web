'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { startOfWeek, addDays, format } from 'date-fns';

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

export default function WeekPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const week = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i)
  );

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('inserted_at', { ascending: true });
    setTasks(data || []);
  };

  const changeDate = async (id: string, newDate: string) => {
    await supabase.from('tasks').update({ due_date: newDate }).eq('id', id);
    fetchTasks();
  };

  useEffect(() => { fetchTasks(); }, []);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">本周任务</h1>
      <div className="grid grid-cols-7 gap-2">
        {week.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter((t) => t.due_date === dateKey);
          return (
            <div key={dateKey} className="border p-2 rounded">
              <h2 className="font-bold text-center">{format(day, 'MM/dd')}</h2>
              {dayTasks.map((t) => (
                <div key={t.id} className="text-sm mt-1 bg-gray-100 p-1 rounded">
                  <div className="flex justify-between">
                    <span>{t.content}</span>
                    <select
                      className="text-xs"
                      value={t.due_date || ''}
                      onChange={(e) => changeDate(t.id, e.target.value)}
                    >
                      {week.map((d) => (
                        <option key={format(d, 'yyyy-MM-dd')} value={format(d, 'yyyy-MM-dd')}>
                          {format(d, 'MM/dd')}
                        </option>
                      ))}
                    </select>
                  </div>
                  {t.assigned_to && (
                    <span className="text-xs text-indigo-500">@{t.assigned_to}</span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}