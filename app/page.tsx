'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, Brain, BarChart3, Volume2 } from 'lucide-react';

export default function Home() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.push('/dashboard');
    }
  }, [firebaseUser, loading, router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Flashcards with Markdown',
      description: 'Create rich flashcards with formatting, code blocks, and more.',
    },
    {
      icon: Brain,
      title: 'Spaced Repetition',
      description: 'SM-2 algorithm optimizes your learning schedule for maximum retention.',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Monitor your learning with detailed statistics and charts.',
    },
    {
      icon: Volume2,
      title: 'Audio Pronunciation',
      description: 'Listen to pronunciation with text-to-speech support.',
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Learn Smarter with <span className="text-primary">FlashCards</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Master vocabulary and programming concepts with spaced repetition.
          Track your progress and learn effectively.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold mb-2">Ready to start learning?</h3>
            <p className="text-muted-foreground mb-4">
              Create your first deck and start mastering new concepts today.
            </p>
            <Button asChild>
              <Link href="/register">Create Free Account</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
