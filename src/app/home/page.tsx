import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '1Stop Instruction - Professional Motorcycle Training London',
  description: 'Professional motorcycle training in London. CBT courses, DAS training, Module 1 & 2 tests. Experienced DVSA approved instructors.',
  keywords: 'motorcycle training London, CBT course, DAS training, Module 1, Module 2, DVSA approved',
  alternates: {
    canonical: '/'
  }
};

export default function HomePage() {
  // Redirect to main homepage for SEO purposes
  // Both / and /home show the same content
  redirect('/');
}