#!/usr/bin/env tsx

import { pluginManager, blockRegistry, doAction, applyFilters } from '../lib/plugin-system';
import contactFormPlugin from '../plugins/contact-form';
import testimonialsPlugin from '../plugins/testimonials';

async function demoPluginSystem() {
  console.log('🔌 Plugin System Demo\n');

  console.log('1. Registering plugins...');
  await pluginManager.register(contactFormPlugin);
  await pluginManager.register(testimonialsPlugin);
  console.log('✓ Plugins registered\n');

  console.log('2. Activating Contact Form plugin...');
  await pluginManager.activate('contact-form');
  console.log('✓ Contact Form activated\n');

  console.log('3. Activating Testimonials plugin...');
  await pluginManager.activate('testimonials');
  console.log('✓ Testimonials activated\n');

  console.log('4. Registered blocks:');
  const blocks = blockRegistry.getAll();
  blocks.forEach((block) => {
    console.log(`   - ${block.label} (${block.type}) ${block.icon}`);
  });
  console.log('');

  console.log('5. Testing form submission hook...');
  await doAction('form_submit', {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello from the demo!',
  });
  console.log('✓ Hook executed\n');

  console.log('6. Testing testimonials filter...');
  const testimonials = [
    { author: 'Alice', rating: 5 },
    { author: 'Bob', rating: 3 },
    { author: 'Charlie', rating: 4 },
  ];
  const filtered = await applyFilters('testimonials_display', testimonials);
  console.log('   Original:', testimonials.length, 'testimonials');
  console.log('   Filtered:', filtered.length, 'testimonials (rating >= 4)');
  console.log('');

  console.log('7. Plugin status:');
  pluginManager.getAll().forEach((plugin) => {
    const status = plugin.active ? '✓ Active' : '✗ Inactive';
    console.log(`   ${status} - ${plugin.plugin.manifest.name}`);
  });
  console.log('');

  console.log('8. Deactivating plugins...');
  await pluginManager.deactivate('contact-form');
  await pluginManager.deactivate('testimonials');
  console.log('✓ Plugins deactivated\n');

  console.log('✨ Demo complete!');
}

demoPluginSystem().catch(console.error);
