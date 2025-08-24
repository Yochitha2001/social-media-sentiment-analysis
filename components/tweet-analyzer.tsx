"use client";

import { useMemo, useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Search, Loader2 } from 'lucide-react';

import { analyzeTweetSentiment } from '@/ai/flows/analyze-tweet-sentiment';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { mockTweets } from '@/lib/mock-data';
import type { AnalysisResult, Tweet } from '@/lib/types';
import SentimentChart from './sentiment-chart';
import TweetCard from './tweet-card';
import { Separator } from './ui/separator';

const formSchema = z.object({
  keyword: z.string().min(2, 'Keyword must be at least 2 characters.'),
});

type SentimentFilter = 'all' | 'positive' | 'negative' | 'neutral';

export default function TweetAnalyzer() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [analyzedTweets, setAnalyzedTweets] = useState<Tweet[]>([]);
  const [sentimentFilter, setSentimentFilter] =
    useState<SentimentFilter>('all');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setAnalysisResults([]);
      setAnalyzedTweets([]);
      
      const keyword = values.keyword.toLowerCase();
      const filteredTweets = mockTweets.filter((tweet) =>
        tweet.text.toLowerCase().includes(keyword)
      );

      if (filteredTweets.length === 0) {
        toast({
          title: 'No tweets found',
          description: `No mock tweets matched the keyword "${values.keyword}".`,
        });
        return;
      }

      try {
        const results = await Promise.all(
          filteredTweets.map(async (tweet) => {
            const result = await analyzeTweetSentiment({ tweetText: tweet.text });
            return {
              tweetId: tweet.id,
              ...result,
            };
          })
        );
        setAnalyzedTweets(filteredTweets);
        setAnalysisResults(results as AnalysisResult[]);
      } catch (error) {
        console.error('Error analyzing sentiment:', error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Could not analyze tweet sentiments. Please try again.',
        });
      }
    });
  }

  const displayedTweets = useMemo(() => {
    if (sentimentFilter === 'all') {
      return analyzedTweets;
    }
    const filteredTweetIds = new Set(
      analysisResults
        .filter((r) => r.sentimentLabel === sentimentFilter)
        .map((r) => r.tweetId)
    );
    return analyzedTweets.filter((t) => filteredTweetIds.has(t.id));
  }, [analysisResults, analyzedTweets, sentimentFilter]);

  const resultsMap = useMemo(() => {
    return new Map(analysisResults.map((r) => [r.tweetId, r]));
  }, [analysisResults]);

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Analyze Tweet Sentiment
        </h2>
        <p className="mt-2 text-muted-foreground">
          Enter a keyword to search our collection of mock tweets and analyze their sentiment.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., 'Next.js' or 'AI'"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze
            </Button>
          </form>
        </Form>
      </div>

      {isPending && (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TweetCard.Skeleton key={i} />
          ))}
        </div>
      )}

      {analysisResults.length > 0 && !isPending && (
        <>
          <Separator />
          <SentimentChart data={analysisResults} />
          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold font-headline">Analyzed Tweets</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={sentimentFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSentimentFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={sentimentFilter === 'positive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSentimentFilter('positive')}
                >
                  Positive
                </Button>
                <Button
                  variant={sentimentFilter === 'negative' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSentimentFilter('negative')}
                >
                  Negative
                </Button>
                <Button
                  variant={sentimentFilter === 'neutral' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSentimentFilter('neutral')}
                >
                  Neutral
                </Button>
              </div>
            </div>

            {displayedTweets.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedTweets.map((tweet) => (
                  <TweetCard
                    key={tweet.id}
                    tweet={tweet}
                    result={resultsMap.get(tweet.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                 <p className="text-muted-foreground">No tweets found for "{sentimentFilter}" sentiment.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
