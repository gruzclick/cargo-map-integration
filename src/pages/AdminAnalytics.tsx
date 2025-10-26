import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportAnalyticsToPDF } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const revenueData: Array<{ date: string; revenue: number; orders: number }> = [];
const regionData: Array<{ region: string; orders: number; revenue: number }> = [];
const userTypeData: Array<{ name: string; value: number; color: string }> = [];
const popularRoutesData: Array<{ route: string; count: number; revenue: number }> = [];
const conversionData: Array<{ stage: string; count: number; percent: number }> = [];

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'pdf') {
      setExporting(true);
      try {
        await exportAnalyticsToPDF({
          title: 'Отчёт по аналитике',
          subtitle: `Период: ${period === 'day' ? 'День' : period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Год'}`,
          stats: [
            { label: 'Общая выручка', value: `${totalRevenue.toLocaleString()} ₽` },
            { label: 'Всего заказов', value: totalOrders },
            { label: 'Средний чек', value: `${avgOrderValue.toLocaleString()} ₽` }
          ],
          chartIds: ['revenue-chart', 'region-chart', 'user-type-chart'],
          filename: `analytics-report-${timestamp}.pdf`
        });
        
        toast({
          title: 'PDF экспортирован',
          description: 'Отчёт с графиками успешно сохранён'
        });
      } catch (error) {
        toast({
          title: 'Ошибка экспорта',
          description: 'Не удалось создать PDF',
          variant: 'destructive'
        });
      } finally {
        setExporting(false);
      }
      return;
    }
    
    if (format === 'csv') {
      let csvContent = 'Дата,Выручка,Заказы\n';
      revenueData.forEach(item => {
        csvContent += `${item.date},${item.revenue},${item.orders}\n`;
      });
      
      csvContent += '\n\nРегион,Заказы,Выручка\n';
      regionData.forEach(item => {
        csvContent += `${item.region},${item.orders},${item.revenue}\n`;
      });
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${timestamp}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      let content = 'Дата\tВыручка\tЗаказы\n';
      revenueData.forEach(item => {
        content += `${item.date}\t${item.revenue}\t${item.orders}\n`;
      });
      
      content += '\n\nРегион\tЗаказы\tВыручка\n';
      regionData.forEach(item => {
        content += `${item.region}\t${item.orders}\t${item.revenue}\n`;
      });
      
      const blob = new Blob(['\uFEFF' + content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${timestamp}.xls`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      let textContent = `ОТЧЁТ ПО АНАЛИТИКЕ\nДата: ${new Date().toLocaleDateString('ru-RU')}\n\n`;
      textContent += `Общая выручка: ${totalRevenue.toLocaleString()} ₽\n`;
      textContent += `Всего заказов: ${totalOrders}\n`;
      textContent += `Средний чек: ${avgOrderValue.toLocaleString()} ₽\n\n`;
      
      textContent += `ДАННЫЕ ПО ДАТАМ:\n`;
      revenueData.forEach(item => {
        textContent += `${item.date}: ${item.revenue.toLocaleString()} ₽, ${item.orders} заказов\n`;
      });
      
      textContent += `\n\nДАННЫЕ ПО РЕГИОНАМ:\n`;
      regionData.forEach(item => {
        textContent += `${item.region}: ${item.orders} заказов, ${item.revenue.toLocaleString()} ₽\n`;
      });
      
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${timestamp}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Icon name="BarChart3" size={32} />
                Аналитика и отчеты
              </h1>
              <p className="text-muted-foreground text-sm">Подробная статистика по всем показателям</p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => handleExport('excel')} 
              disabled={exporting}
              className="text-sm"
            >
              <Icon name="FileSpreadsheet" size={16} className="mr-2" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('csv')} 
              disabled={exporting}
              className="text-sm"
            >
              <Icon name="FileText" size={16} className="mr-2" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('pdf')} 
              disabled={exporting}
              className="text-sm"
            >
              {exporting ? (
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              ) : (
                <Icon name="FileDown" size={16} className="mr-2" />
              )}
              <span className="hidden sm:inline">{exporting ? 'Экспорт...' : 'PDF'}</span>
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={period === 'day' ? 'default' : 'outline'} 
            onClick={() => setPeriod('day')}
            className="text-sm"
          >
            День
          </Button>
          <Button 
            variant={period === 'week' ? 'default' : 'outline'} 
            onClick={() => setPeriod('week')}
            className="text-sm"
          >
            Неделя
          </Button>
          <Button 
            variant={period === 'month' ? 'default' : 'outline'} 
            onClick={() => setPeriod('month')}
            className="text-sm"
          >
            Месяц
          </Button>
          <Button 
            variant={period === 'year' ? 'default' : 'outline'} 
            onClick={() => setPeriod('year')}
            className="text-sm"
          >
            Год
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Общий доход</CardDescription>
              <CardTitle className="text-3xl">{totalRevenue.toLocaleString('ru-RU')} ₽</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Icon name="TrendingUp" size={16} />
                +12.5% к прошлому периоду
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Всего заказов</CardDescription>
              <CardTitle className="text-3xl">{totalOrders}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Icon name="TrendingUp" size={16} />
                +8.3% к прошлому периоду
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Средний чек</CardDescription>
              <CardTitle className="text-3xl">{avgOrderValue.toLocaleString('ru-RU')} ₽</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Icon name="TrendingUp" size={16} />
                +3.7% к прошлому периоду
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="revenue">Доходы</TabsTrigger>
            <TabsTrigger value="regions">Регионы</TabsTrigger>
            <TabsTrigger value="routes">Маршруты</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="conversion">Конверсия</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>График доходов и заказов</CardTitle>
                <CardDescription>Динамика по дням</CardDescription>
              </CardHeader>
              <CardContent id="revenue-chart">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="Доход (₽)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Заказы"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Статистика по регионам</CardTitle>
                <CardDescription>Заказы и доход по городам</CardDescription>
              </CardHeader>
              <CardContent id="region-chart">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Заказы" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Доход (₽)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Популярные маршруты</CardTitle>
                <CardDescription>Топ-5 самых востребованных направлений</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularRoutesData.map((route, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="text-lg px-3">#{idx + 1}</Badge>
                        <div>
                          <p className="font-semibold">{route.route}</p>
                          <p className="text-sm text-muted-foreground">{route.count} заказов</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{route.revenue.toLocaleString('ru-RU')} ₽</p>
                        <p className="text-sm text-muted-foreground">доход</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Распределение пользователей</CardTitle>
                <CardDescription>Соотношение клиентов и перевозчиков</CardDescription>
              </CardHeader>
              <CardContent id="user-type-chart">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Воронка конверсии</CardTitle>
                <CardDescription>Путь клиента от посещения до постоянных заказов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conversionData.map((stage, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="text-sm text-muted-foreground">
                          {stage.count.toLocaleString('ru-RU')} ({stage.percent}%)
                        </span>
                      </div>
                      <div className="h-12 bg-muted rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold transition-all"
                          style={{ width: `${stage.percent * 10}%` }}
                        >
                          {stage.percent}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}