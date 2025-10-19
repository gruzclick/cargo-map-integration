import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const AccessibilityToggle = () => {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('high-contrast');
    if (saved === 'true') {
      setHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggleContrast = () => {
    const newState = !highContrast;
    setHighContrast(newState);
    
    if (newState) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('high-contrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('high-contrast', 'false');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleContrast}
      className="rounded-lg"
      title={highContrast ? 'Выключить высокий контраст' : 'Включить высокий контраст'}
    >
      <Icon name="Eye" size={18} className={highContrast ? 'text-yellow-500' : ''} />
    </Button>
  );
};

export default AccessibilityToggle;
