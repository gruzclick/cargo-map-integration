import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface BiometricCameraProps {
  type: 'face' | 'iris';
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export const BiometricCamera = ({ type, onCapture, onCancel }: BiometricCameraProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error: any) {
      toast({
        title: 'Ошибка доступа к камере',
        description: 'Не удалось получить доступ к камере. Проверьте разрешения.',
        variant: 'destructive'
      });
      console.error('Ошибка камеры:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCountdown = () => {
    setCapturing(true);
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          captureImage();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (type === 'iris') {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.15;

      context.strokeStyle = '#22c55e';
      context.lineWidth = 3;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      context.stroke();
    }

    const imageData = canvas.toDataURL('image/jpeg', 0.95);

    stopCamera();
    setCapturing(false);

    toast({
      title: 'Снимок сделан',
      description: `${type === 'face' ? 'Лицо' : 'Радужка глаза'} успешно отсканировано`,
    });

    onCapture(imageData);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
          />
          <canvas ref={canvasRef} className="hidden" />

          {type === 'face' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-80 border-4 border-green-500 rounded-full opacity-50" />
            </div>
          )}

          {type === 'iris' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <div className="w-48 h-48 border-4 border-green-500 rounded-full" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-yellow-400 rounded-full" />
              </div>
            </div>
          )}

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-9xl font-bold text-white animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 right-4">
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-center">
              {type === 'face' ? (
                <>
                  <Icon name="Smile" size={20} className="inline mr-2" />
                  Расположите лицо в рамке
                </>
              ) : (
                <>
                  <Icon name="Eye" size={20} className="inline mr-2" />
                  Приблизьте глаз к камере
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 flex gap-2">
          <Button
            onClick={startCountdown}
            disabled={capturing || !stream}
            className="flex-1"
          >
            <Icon name="Camera" size={20} className="mr-2" />
            {capturing ? 'Сканирование...' : 'Сделать снимок'}
          </Button>
          <Button onClick={handleCancel} variant="outline">
            <Icon name="X" size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
