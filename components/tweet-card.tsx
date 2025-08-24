import { Frown, Meh, Smile } from 'lucide-react';
import type { FC } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { AnalysisResult, Tweet } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface TweetCardProps {
  tweet: Tweet;
  result?: AnalysisResult;
}

const sentimentConfig = {
  positive: {
    icon: Smile,
    color: 'bg-green-500',
    badgeVariant: 'default' as const,
    label: 'Positive',
  },
  negative: {
    icon: Frown,
    color: 'bg-red-500',
    badgeVariant: 'destructive' as const,
    label: 'Negative',
  },
  neutral: {
    icon: Meh,
    color: 'bg-gray-500',
    badgeVariant: 'secondary' as const,
    label: 'Neutral',
  },
};

const TweetCard: FC<TweetCardProps> = ({ tweet, result }) => {
  const { author, handle, avatar, text, timestamp } = tweet;
  const sentiment = result
    ? sentimentConfig[result.sentimentLabel]
    : sentimentConfig.neutral;
  const Icon = sentiment.icon;
  const scorePercentage = result ? (result.sentimentScore + 1) * 50 : 50;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={avatar} alt={`@${handle}`} data-ai-hint="person portrait" />
              <AvatarFallback>{author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{author}</CardTitle>
              <CardDescription>@{handle}</CardDescription>
            </div>
          </div>
          <Badge variant={sentiment.badgeVariant}>{sentiment.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-foreground/90">{text}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <span>Sentiment Score</span>
          <span>{result ? result.sentimentScore.toFixed(2) : 'N/A'}</span>
        </div>
        <Progress value={scorePercentage} className={cn('h-2', sentiment.color)} />
        <time className="text-xs text-muted-foreground pt-2">
          {new Date(timestamp).toLocaleString()}
        </time>
      </CardFooter>
    </Card>
  );
};

const TweetCardSkeleton = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-3 w-[80px]" />
                    </div>
                </div>
                <Skeleton className="h-6 w-[70px] rounded-full" />
            </div>
        </CardHeader>
        <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
            <Skeleton className="h-3 w-[100px]" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-[150px] mt-2" />
        </CardFooter>
    </Card>
);

TweetCard.Skeleton = TweetCardSkeleton;

export default TweetCard;
