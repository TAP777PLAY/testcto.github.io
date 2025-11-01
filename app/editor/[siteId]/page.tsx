'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BlockEditor, { Block } from '@/components/BlockEditor';
import Link from 'next/link';

type Page = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  blocks: Block[];
};

type Site = {
  id: string;
  name: string;
  slug: string;
  pages: Page[];
};

export default function EditorPage({ params }: { params: Promise<{ siteId: string }> }) {
  const resolvedParams = use(params);
  const { status } = useSession();
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchSite();
    }
  }, [status, router]);

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/sites/${resolvedParams.siteId}`);
      if (response.ok) {
        const data = await response.json();
        setSite(data);
        setCurrentPage(data.pages[0]);
      } else {
        alert('Сайт не найден');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Ошибка загрузки сайта:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBlocks = async (blocks: Block[]) => {
    if (!currentPage) return;
    
    setCurrentPage({ ...currentPage, blocks });
    setSaving(true);

    try {
      await fetch(`/api/pages/${currentPage.id}/blocks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocks }),
      });
    } catch (error) {
      console.error('Ошибка сохранения блоков:', error);
      alert('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async (type: string) => {
    if (!currentPage) return;

    const defaultContent = {
      heading: { text: 'Новый заголовок', level: 'h2' },
      text: { text: 'Новый текстовый блок' },
      image: { url: '', alt: '' },
      button: { text: 'Кнопка', link: '#', style: 'primary' },
    };

    try {
      const response = await fetch(`/api/pages/${currentPage.id}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          content: defaultContent[type as keyof typeof defaultContent],
          order: currentPage.blocks.length,
        }),
      });

      if (response.ok) {
        const newBlock = await response.json();
        setCurrentPage({
          ...currentPage,
          blocks: [...currentPage.blocks, newBlock],
        });
      }
    } catch (error) {
      console.error('Ошибка добавления блока:', error);
      alert('Не удалось добавить блок');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!currentPage) return;

    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCurrentPage({
          ...currentPage,
          blocks: currentPage.blocks.filter((b) => b.id !== blockId),
        });
      }
    } catch (error) {
      console.error('Ошибка удаления блока:', error);
      alert('Не удалось удалить блок');
    }
  };

  const handlePublishPage = async () => {
    if (!currentPage) return;

    try {
      const response = await fetch(`/api/pages/${currentPage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentPage,
          published: !currentPage.published,
        }),
      });

      if (response.ok) {
        const updatedPage = await response.json();
        setCurrentPage(updatedPage);
      }
    } catch (error) {
      console.error('Ошибка публикации:', error);
      alert('Не удалось изменить статус публикации');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка редактора...</div>
      </div>
    );
  }

  if (!site || !currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Сайт не найден</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Назад
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{site.name}</h1>
                <p className="text-sm text-gray-500">{currentPage.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saving && <span className="text-sm text-gray-500">Сохранение...</span>}
              <button
                onClick={handlePublishPage}
                className={`px-4 py-2 rounded ${
                  currentPage.published
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {currentPage.published ? '✓ Опубликовано' : 'Опубликовать'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Редактор страницы</h2>
            <p className="text-gray-600">
              Добавляйте и редактируйте блоки, перетаскивайте их для изменения порядка
            </p>
          </div>

          <BlockEditor
            blocks={currentPage.blocks}
            onUpdateBlocks={handleUpdateBlocks}
            onAddBlock={handleAddBlock}
            onDeleteBlock={handleDeleteBlock}
          />
        </div>
      </div>
    </div>
  );
}
