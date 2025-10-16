import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const MapLegend = () => {
  return (
    <Card className="border-0 shadow-md rounded-2xl bg-card">
      <CardContent className="p-6">
        <h3 className="font-semibold text-sm mb-4 tracking-tight">Легенда карты</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Типы грузов:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                  <Icon name="Package" size={18} className="text-white" />
                </div>
                <span className="text-xs">Короб</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                  <Icon name="Box" size={18} className="text-white" />
                </div>
                <span className="text-xs">Паллета</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Типы транспорта:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Car" size={18} className="text-white" />
                </div>
                <span className="text-xs">Легковой</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Truck" size={18} className="text-white" />
                </div>
                <span className="text-xs">Грузовой</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Container" size={18} className="text-white" />
                </div>
                <span className="text-xs">Фура</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLegend;