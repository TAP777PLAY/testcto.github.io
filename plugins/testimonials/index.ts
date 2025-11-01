import { Plugin } from '@/lib/plugin-system/types';
import manifest from './manifest.json';

const testimonialsPlugin: Plugin = {
  manifest,

  activate: async (api) => {
    api.registerBlock({
      type: 'testimonials',
      label: 'Testimonials',
      icon: '⭐',
      category: 'content',
      defaultContent: {
        title: 'What Our Customers Say',
        testimonials: [
          {
            id: '1',
            content: 'This product completely transformed our business. Highly recommended!',
            author: 'John Doe',
            role: 'CEO, Example Corp',
            avatar: '',
            rating: 5,
          },
          {
            id: '2',
            content: 'Outstanding service and support. The team went above and beyond.',
            author: 'Jane Smith',
            role: 'Marketing Director',
            avatar: '',
            rating: 5,
          },
          {
            id: '3',
            content: 'Easy to use and powerful features. Worth every penny!',
            author: 'Mike Johnson',
            role: 'Freelancer',
            avatar: '',
            rating: 5,
          },
        ],
        layout: 'grid',
        columns: 3,
      },
    });

    api.addFilter('testimonials_display', (testimonials: any[]) => {
      return testimonials.filter((t) => t.rating >= 4);
    });

    console.log('Testimonials plugin activated');
  },

  deactivate: async (api) => {
    console.log('Testimonials plugin deactivated');
  },

  install: async (api) => {
    await api.setOption('min_rating', 4);
    await api.setOption('show_avatars', true);
    console.log('Testimonials plugin installed');
  },

  uninstall: async (api) => {
    console.log('Testimonials plugin uninstalled');
  },
};

export default testimonialsPlugin;
