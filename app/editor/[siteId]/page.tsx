'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageBuilder } from '@/components/PageBuilder/PageBuilder';
import { Block } from '@/components/BlockEditor';

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

const getDefaultContent = (type: string) => {
  const defaults: Record<string, any> = {
    heading: { text: 'Новый заголовок', level: 'h2', styles: {} },
    text: { text: 'Новый текстовый блок', styles: {} },
    image: { url: '', alt: '', width: '100%', styles: {} },
    gallery: { images: [], columns: 3, styles: {} },
    button: { text: 'Кнопка', link: '#', style: 'primary', styles: {} },
    form: { 
      title: 'Новая форма',
      fields: [],
      submitText: 'Отправить',
      styles: {}
    },
    divider: { thickness: '1px', style: 'solid', styles: {} },
    spacer: { height: '40px', styles: {} },
  };
  return defaults[type] || { styles: {} };
};

export default function EditorPage({ params }: { params: Promise<{ siteId: string }> }) {
  const resolvedParams = use(params);
  const { status } = useSession();
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

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
        if (data.pages && data.pages.length > 0) {
          setCurrentPage(data.pages[0]);
        }
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

  const handleSave = async (blocks: Block[]) => {
    if (!currentPage) return;

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
    }
  };

  const handleAddBlock = async (type: string): Promise<Block> => {
    if (!currentPage) throw new Error('No page selected');

    const order = currentPage.blocks.length;
    const content = getDefaultContent(type);

    try {
      const response = await fetch(`/api/pages/${currentPage.id}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, content, order }),
      });

      if (response.ok) {
        const newBlock = await response.json();
        setCurrentPage({
          ...currentPage,
          blocks: [...currentPage.blocks, newBlock],
        });
        return newBlock;
      } else {
        throw new Error('Failed to create block');
      }
    } catch (error) {
      console.error('Ошибка добавления блока:', error);
      throw error;
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Загрузка редактора...</div>
        </div>
      </div>
    );
  }

  if (!site || !currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <div className="text-xl text-gray-600">Сайт не найден</div>
        </div>
      </div>
    );
  }

  return (
    <PageBuilder
      initialBlocks={currentPage.blocks}
      onSave={handleSave}
      onAddBlock={handleAddBlock}
      onDeleteBlock={handleDeleteBlock}
    />
  );
}
