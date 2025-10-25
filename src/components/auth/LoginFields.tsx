import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface LoginFieldsProps {
  email: string;
  password: string;
  showPassword: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
}

const LoginFields = ({
  email,
  password,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword
}: LoginFieldsProps) => {
  return (
    <>
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="email" className="text-xs sm:text-sm">Email или телефон</Label>
        <Input
          id="email"
          type="text"
          placeholder="example@mail.ru"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          className="h-10 sm:h-11 text-sm sm:text-base"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="password" className="text-xs sm:text-sm">Пароль</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            className="h-10 sm:h-11 text-sm sm:text-base pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2 sm:px-3 hover:bg-transparent"
            onClick={onTogglePassword}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} className="text-muted-foreground sm:w-[18px] sm:h-[18px]" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default LoginFields;