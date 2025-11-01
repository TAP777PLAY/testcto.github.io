import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PluginsList from '@/components/PluginsList';

export default async function PluginsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plugins</h1>
        <p className="text-gray-600">
          Extend your site with powerful plugins
        </p>
      </div>

      <PluginsList />
    </div>
  );
}
