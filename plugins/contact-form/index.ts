import { Plugin } from '@/lib/plugin-system/types';
import manifest from './manifest.json';

const contactFormPlugin: Plugin = {
  manifest,

  activate: async (api) => {
    api.registerBlock({
      type: 'contact-form',
      label: 'Contact Form',
      icon: '📧',
      category: 'forms',
      defaultContent: {
        title: 'Get in Touch',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'message', label: 'Message', type: 'textarea', required: true },
        ],
        submitText: 'Send Message',
        successMessage: 'Thank you! We\'ll get back to you soon.',
        recipientEmail: '',
      },
    });

    api.addAction('form_submit', async (formData: any) => {
      console.log('Contact form submitted:', formData);
    });

    console.log('Contact Form plugin activated');
  },

  deactivate: async (api) => {
    console.log('Contact Form plugin deactivated');
  },

  install: async (api) => {
    await api.setOption('enabled', true);
    await api.setOption('spam_protection', true);
    console.log('Contact Form plugin installed');
  },

  uninstall: async (api) => {
    console.log('Contact Form plugin uninstalled');
  },
};

export default contactFormPlugin;
