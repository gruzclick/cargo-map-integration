import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Promo {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  minAmount: number;
  maxUses: number;
  used: number;
  active: boolean;
  expiryDate: string;
}

const promosData: Promo[] = [];

export default function AdminMarketing() {
  const { toast } = useToast();
  const [promos, setPromos] = useState<Promo[]>(promosData);
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount: 10,
    type: 'percent' as 'percent' | 'fixed',
    minAmount: 0,
    maxUses: 100
  });

  const handleCreatePromo = () => {
    if (!newPromo.code) {
      toast({
        title: 'Ошибка',
        description: 'Введите код промокода',
        variant: 'destructive'
      });
      return;
    }

    const promo: Promo = {
      id: Date.now().toString(),
      code: newPromo.code.toUpperCase(),
      discount: newPromo.discount,
      type: newPromo.type,
      minAmount: newPromo.minAmount,
      maxUses: newPromo.maxUses,
      used: 0,
      active: true,
      expiryDate: '2025-12-31'
    };

    setPromos([...promos, promo]);
    setNewPromo({ code: '', discount: 10, type: 'percent', minAmount: 0, maxUses: 100 });
    toast({
      title: 'Промокод создан',
      description: `Промокод ${promo.code} активирован`
    });
  };

  const handleTogglePromo = (id: string) => {
    setPromos(promos.map(p => p.id === id ? { ...p, active: !p.active } : p));
    toast({
      title: 'Статус изменен',
      description: 'Промокод обновлен'
    });
  };

  const handleDeletePromo = (id: string) => {
    setPromos(promos.filter(p => p.id !== id));
    toast({
      title: 'Промокод удален',
      description: 'Промокод удален из системы'
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Icon name="Target" size={32} />
              Маркетинг
            </h1>
            <p className="text-muted-foreground">Промокоды и специальные предложения</p>
          </div>
        </div>

        <Tabs defaultValue="promos" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="promos">Промокоды</TabsTrigger>
          </TabsList>

          <TabsContent value="promos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Создать промокод</CardTitle>
                <CardDescription>Скидка для клиентов по специальному коду</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promo-code">Код промокода</Label>
                    <Input
                      id="promo-code"
                      placeholder="SUMMER2025"
                      value={newPromo.code}
                      onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-type">Тип скидки</Label>
                    <Select value={newPromo.type} onValueChange={(val: 'percent' | 'fixed') => setNewPromo({ ...newPromo, type: val })}>
                      <SelectTrigger id="promo-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Процент (%)</SelectItem>
                        <SelectItem value="fixed">Фиксированная сумма (₽)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-discount">
                      Размер скидки {newPromo.type === 'percent' ? '(%)' : '(₽)'}
                    </Label>
                    <Input
                      id="promo-discount"
                      type="number"
                      value={newPromo.discount}
                      onChange={(e) => setNewPromo({ ...newPromo, discount: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-min">Минимальная сумма заказа (₽)</Label>
                    <Input
                      id="promo-min"
                      type="number"
                      value={newPromo.minAmount}
                      onChange={(e) => setNewPromo({ ...newPromo, minAmount: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-max">Максимум использований</Label>
                    <Input
                      id="promo-max"
                      type="number"
                      value={newPromo.maxUses}
                      onChange={(e) => setNewPromo({ ...newPromo, maxUses: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <Button onClick={handleCreatePromo} className="w-full">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Создать промокод
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Активные промокоды ({promos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {promos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Ticket" size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Промокоды не созданы</p>
                    <p className="text-sm">Создайте первый промокод для привлечения клиентов</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Код</TableHead>
                          <TableHead>Скидка</TableHead>
                          <TableHead>Мин. сумма</TableHead>
                          <TableHead>Использований</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promos.map((promo) => (
                          <TableRow key={promo.id}>
                            <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                            <TableCell>
                              {promo.type === 'percent' 
                                ? `${promo.discount}%` 
                                : `${promo.discount} ₽`}
                            </TableCell>
                            <TableCell>{promo.minAmount} ₽</TableCell>
                            <TableCell>
                              {promo.used} / {promo.maxUses}
                            </TableCell>
                            <TableCell>
                              <Badge variant={promo.active ? 'default' : 'secondary'}>
                                {promo.active ? 'Активен' : 'Неактивен'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTogglePromo(promo.id)}
                                >
                                  <Icon name={promo.active ? 'Pause' : 'Play'} size={16} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePromo(promo.id)}
                                >
                                  <Icon name="Trash2" size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
