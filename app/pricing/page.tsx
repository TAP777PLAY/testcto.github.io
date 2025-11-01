'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  maxSites: number;
  maxPages: number;
  customDomain: boolean;
  aiCredits: number;
  marketplaceAccess: boolean;
  priority: number;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.clientSecret) {
          router.push(`/dashboard/billing?setup=${data.clientSecret}`);
        } else {
          router.push('/dashboard/billing');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Загрузка тарифов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Выберите свой тариф
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Начните создавать сайты с подходящим вам планом
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
            >
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                {plan.description && (
                  <p className="mt-2 text-gray-600">{plan.description}</p>
                )}

                <p className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0
                      ? 'Бесплатно'
                      : `${plan.price / 100} ${plan.currency}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-base font-medium text-gray-600">
                      /{plan.interval === 'month' ? 'месяц' : 'год'}
                    </span>
                  )}
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex">
                    <svg
                      className="h-6 w-6 flex-shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-700">
                      {plan.maxSites === -1
                        ? 'Неограниченное количество сайтов'
                        : `${plan.maxSites} ${plan.maxSites === 1 ? 'сайт' : 'сайта'}`}
                    </span>
                  </li>
                  <li className="flex">
                    <svg
                      className="h-6 w-6 flex-shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-700">
                      {plan.maxPages === -1
                        ? 'Неограниченное количество страниц'
                        : `До ${plan.maxPages} страниц на сайт`}
                    </span>
                  </li>
                  {plan.customDomain && (
                    <li className="flex">
                      <svg
                        className="h-6 w-6 flex-shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-700">Свой домен</span>
                    </li>
                  )}
                  {plan.aiCredits > 0 && (
                    <li className="flex">
                      <svg
                        className="h-6 w-6 flex-shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-700">
                        {plan.aiCredits === -1
                          ? 'Неограниченная AI генерация'
                          : `${plan.aiCredits} AI кредитов/месяц`}
                      </span>
                    </li>
                  )}
                  {plan.marketplaceAccess && (
                    <li className="flex">
                      <svg
                        className="h-6 w-6 flex-shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-700">Доступ к маркетплейсу</span>
                    </li>
                  )}
                  {Array.isArray(plan.features) &&
                    plan.features.map((feature, index) => (
                      <li key={index} className="flex">
                        <svg
                          className="h-6 w-6 flex-shrink-0 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="ml-3 text-gray-700">{feature}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                className="mt-8 block w-full rounded-md bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                {plan.price === 0 ? 'Начать бесплатно' : 'Подписаться'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-gray-600">
          <p>Все тарифы включают техническую поддержку и регулярные обновления</p>
          <p className="mt-2">Можно отменить подписку в любое время</p>
        </div>
      </div>
    </div>
  );
}
