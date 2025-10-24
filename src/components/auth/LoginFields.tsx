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
      <div className="space-y-2">
        <Label htmlFor="email">Email или телефон</Label>
        <Input
          id="email"
          type="text"
          placeholder="example@mail.ru или +7 (999) 123-45-67"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={onTogglePassword}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} className="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default LoginFields;
