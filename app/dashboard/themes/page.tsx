import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ThemeSelector from '@/components/ThemeSelector';

export default async function ThemesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Themes</h1>
        <p className="text-gray-600">
          Customize your site's appearance with beautiful themes
        </p>
      </div>

      <ThemeSelector />
    </div>
  );
}
