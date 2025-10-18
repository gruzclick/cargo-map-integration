import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Package, Star, MapPin } from 'lucide-react';

interface DriverAnalyticsProps {
  driverId: string;
}

interface AnalyticsData {
  totalOrders: number;
  completedOrders: number;
  averageRating: number;
  totalReviews: number;
  popularRoutes: { from: string; to: string; count: number }[];
}

export function DriverAnalytics({ driverId }: DriverAnalyticsProps) {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [driverId]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/driver/${driverId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">{t('common.loading')}</div>;
  }

  if (!analytics) {
    return <div className="text-center p-8">{t('analytics.noData')}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t('analytics.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('analytics.totalOrders')}</p>
              <p className="text-2xl font-bold">{analytics.totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('analytics.completedOrders')}</p>
              <p className="text-2xl font-bold">{analytics.completedOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('analytics.averageRating')}</p>
              <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">
                {analytics.totalReviews} {t('analytics.reviews')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('analytics.completionRate')}</p>
              <p className="text-2xl font-bold">
                {analytics.totalOrders > 0
                  ? Math.round((analytics.completedOrders / analytics.totalOrders) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">{t('analytics.popularRoutes')}</h3>
        {analytics.popularRoutes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('analytics.noRoutes')}</p>
        ) : (
          <div className="space-y-3">
            {analytics.popularRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{route.from}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{route.to}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {route.count} {t('analytics.trips')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
