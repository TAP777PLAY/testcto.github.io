'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link
                href="/admin"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-900"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                👥 Пользователи
              </Link>
              <Link
                href="/admin/pages"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                📄 Страницы
              </Link>
              <Link
                href="/admin/media"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                🖼️ Медиа
              </Link>
              <Link
                href="/admin/analytics"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                📈 Аналитика
              </Link>
              <Link
                href="/admin/logs"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                📝 Логи
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                ← Мой Dashboard
              </Link>
              <span className="text-sm text-gray-900">
                {session?.user?.name || session?.user?.email}
              </span>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
