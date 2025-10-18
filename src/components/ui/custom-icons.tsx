interface CustomIconProps {
  size?: number;
  className?: string;
}

export function BoxIcon({ size = 24, className = '' }: CustomIconProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-primary font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      К
    </div>
  );
}

export function PalletIcon({ size = 24, className = '' }: CustomIconProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      П
    </div>
  );
}
