'use client';

interface Testimonial {
  id: string;
  content: string;
  author: string;
  role: string;
  avatar?: string;
  rating: number;
}

interface TestimonialsContent {
  title: string;
  testimonials: Testimonial[];
  layout: 'grid' | 'carousel' | 'list';
  columns: number;
}

interface TestimonialsBlockProps {
  content: TestimonialsContent;
}

export function TestimonialsBlock({ content }: TestimonialsBlockProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[content.columns] || 'md:grid-cols-3';

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-12">{content.title}</h2>
      <div className={`grid ${gridCols} gap-6`}>
        {content.testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            {renderStars(testimonial.rating)}
            <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
            <div className="flex items-center gap-3">
              {testimonial.avatar ? (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {testimonial.author.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
