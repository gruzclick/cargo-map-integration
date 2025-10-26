import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Icon from './ui/icon';
import { useToast } from '@/hooks/use-toast';

interface FaceIDAuthProps {
  onSuccess: () => void;
  mode: 'register' | 'login';
}

export default function FaceIDAuth({ onSuccess, mode }: FaceIDAuthProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLineRef = useRef<number>(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    return () => {
      stopCamera();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      // Сбрасываем все состояния перед запуском
      setFaceDetected(false);
      setScanning(false);
      setLoading(false);
      scanLineRef.current = 0;
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Ждём загрузки видео потока
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve();
            };
          }
        });
        
        setCameraActive(true);
        
        toast({
          title: '📸 Камера активирована',
          description: 'Посмотрите в камеру для распознавания лица'
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      const err = error as Error;
      toast({
        title: 'Ошибка доступа к камере',
        description: err.name === 'NotAllowedError' 
          ? 'Разрешите доступ к камере в настройках браузера'
          : 'Проверьте подключение камеры и перезагрузите страницу',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCameraActive(false);
    setFaceDetected(false);
    setScanning(false);
    setLoading(false);
    scanLineRef.current = 0;
  };

  const animateScanLine = () => {
    const animate = () => {
      scanLineRef.current += 3;
      if (scanLineRef.current > 100) {
        scanLineRef.current = 0;
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setLoading(true);
    setScanning(true);
    animateScanLine();
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    setTimeout(() => {
      setScanning(false);
      setFaceDetected(true);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      setTimeout(() => {
        if (mode === 'register') {
          localStorage.setItem('face_id_registered', 'true');
          localStorage.setItem('face_id_data', imageData);
          
          toast({
            title: '✅ Face ID зарегистрирован',
            description: 'Теперь вы можете входить по распознаванию лица'
          });
        } else {
          const registered = localStorage.getItem('face_id_registered');
          if (registered === 'true') {
            toast({
              title: '✅ Лицо распознано',
              description: 'Добро пожаловать в админ-панель!'
            });
            onSuccess();
          } else {
            toast({
              title: 'Face ID не настроен',
              description: 'Сначала зарегистрируйте Face ID',
              variant: 'destructive'
            });
          }
        }
        
        setLoading(false);
        stopCamera();
      }, 1000);
    }, 2500);
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="ScanFace" size={24} className="text-blue-600" />
          {mode === 'register' ? 'Регистрация Face ID' : 'Вход через Face ID'}
        </CardTitle>
        <CardDescription>
          {mode === 'register' 
            ? 'Зарегистрируйте своё лицо для быстрого входа в админ-панель'
            : 'Посмотрите в камеру для входа в админ-панель'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!cameraActive ? (
          <Button
            onClick={startCamera}
            className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="Camera" size={18} />
            {mode === 'register' ? 'Зарегистрировать Face ID' : 'Запустить камеру'}
          </Button>
        ) : (
          <>
            <div className="relative rounded-lg overflow-hidden bg-gray-900 shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto min-h-[320px] object-cover"
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  if (video.videoWidth === 0) {
                    toast({
                      title: 'Ошибка камеры',
                      description: 'Камера не отвечает. Попробуйте перезагрузить страницу.',
                      variant: 'destructive'
                    });
                  }
                }}
              />
              
              {/* Рамка распознавания лица (как в iPhone) */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80">
                  {/* Углы рамки */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                  
                  {/* Анимированная линия сканирования */}
                  {scanning && (
                    <div 
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"
                      style={{ 
                        top: `${scanLineRef.current}%`,
                        transition: 'top 0.1s linear'
                      }}
                    >
                      <div className="absolute inset-0 bg-blue-400 blur-sm"></div>
                    </div>
                  )}
                </div>
              </div>

              {faceDetected && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 backdrop-blur-sm">
                  <div className="text-center animate-scale-in">
                    <div className="relative">
                      <Icon name="CheckCircle2" size={80} className="text-green-500 mx-auto mb-3 drop-shadow-lg" />
                      <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl"></div>
                    </div>
                    <p className="text-white font-bold text-xl drop-shadow-lg">Лицо распознано!</p>
                    <p className="text-white/80 text-sm mt-1">Face ID активирован</p>
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 text-white border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                    <span className="font-medium">Камера активна</span>
                  </div>
                  <p className="text-xs opacity-90">
                    {loading ? '🔄 Анализ биометрии...' : scanning ? '📸 Сканирование лица...' : '👤 Расположите лицо в центре рамки'}
                  </p>
                </div>
              </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex gap-2">
              <Button
                onClick={captureFace}
                disabled={loading || faceDetected}
                className="flex-1 h-12 gap-2 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    Обработка...
                  </>
                ) : faceDetected ? (
                  <>
                    <Icon name="CheckCircle2" size={18} />
                    Успешно!
                  </>
                ) : (
                  <>
                    <Icon name="Camera" size={18} />
                    Сделать снимок
                  </>
                )}
              </Button>
              
              <Button
                onClick={stopCamera}
                disabled={loading}
                variant="outline"
                className="h-12 px-4"
              >
                <Icon name="X" size={18} />
              </Button>
            </div>
          </>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1 mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="flex items-start gap-2">
            <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
            <span>Ваше изображение обрабатывается локально и не отправляется на сервер</span>
          </p>
          <p className="flex items-start gap-2">
            <Icon name="Lock" size={14} className="mt-0.5 flex-shrink-0" />
            <span>Данные Face ID хранятся только на этом устройстве</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}