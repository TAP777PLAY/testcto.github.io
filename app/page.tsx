import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">SiteBuilder</h1>
          <div className="space-x-4">
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-blue-600 hover:text-blue-800"
            >
              Войти
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Конструктор сайтов на русском языке
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Создавайте современные сайты без навыков программирования.
            Визуальный редактор, готовые шаблоны и простое управление контентом.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition"
            >
              Начать бесплатно
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg rounded-lg hover:bg-blue-50 transition"
            >
              Демо-версия
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-3">Визуальный редактор</h3>
            <p className="text-gray-600">
              Редактируйте сайт в режиме реального времени с помощью удобного drag-and-drop интерфейса
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-3">Готовые шаблоны</h3>
            <p className="text-gray-600">
              Выбирайте из коллекции профессиональных шаблонов для быстрого старта
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3">Быстрая публикация</h3>
            <p className="text-gray-600">
              Опубликуйте ваш сайт одним кликом и получите готовую ссылку для доступа
            </p>
          </div>
        </div>

        <div className="mt-20 max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Возможности MVP</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <h4 className="font-semibold">CRUD страниц</h4>
                <p className="text-gray-600">Создание, редактирование и публикация страниц</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <h4 className="font-semibold">Блочный редактор</h4>
                <p className="text-gray-600">Заголовки, тексты, изображения, кнопки</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <h4 className="font-semibold">Система тем</h4>
                <p className="text-gray-600">Настройка цветов и шрифтов</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <h4 className="font-semibold">Авторизация</h4>
                <p className="text-gray-600">Управление пользователями и ролями</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <h4 className="font-semibold">REST API</h4>
                <p className="text-gray-600">Полный доступ через API для интеграций</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <h4 className="font-semibold">Vercel Deploy</h4>
                <p className="text-gray-600">Готовая интеграция с Vercel для хостинга</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-gray-600">
          <p>© 2024 SiteBuilder. Конструктор сайтов на русском языке.</p>
        </div>
      </footer>
    </div>
  );
}
