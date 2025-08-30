import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../design-system/utils/cn';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Camera, Video, RotateCcw, Zap, ZapOff, Grid3X3, Circle, Square, Timer, Palette, Sparkles, Download, X, Settings, Sun, Moon, Focus, Maximize2, Volume2, VolumeX, Play, Pause, StopCircle, MoreHorizontal, Filter, Crop, RotateCw, FlipHorizontal, FlipVertical, Contrast, Copyright as Brightness4, IterationCw as Saturation } from 'lucide-react';

interface CameraSettings {
  facingMode: 'user' | 'environment';
  flash: boolean;
  grid: boolean;
  timer: 0 | 3 | 10;
  quality: 'low' | 'medium' | 'high';
  aspectRatio: '1:1' | '4:5' | '9:16' | '16:9';
  filters: string[];
}

interface CapturedMedia {
  id: string;
  type: 'photo' | 'video';
  blob: Blob;
  url: string;
  timestamp: Date;
  duration?: number;
  thumbnail?: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    aspectRatio: string;
  };
}

export interface CameraCaptureProps {
  onCapture: (media: CapturedMedia) => void;
  onClose: () => void;
  mode?: 'photo' | 'video' | 'both';
  maxDuration?: number; // seconds
  className?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  mode = 'both',
  maxDuration = 60,
  className
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentMode, setCurrentMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [settings, setSettings] = useState<CameraSettings>({
    facingMode: 'environment',
    flash: false,
    grid: false,
    timer: 0,
    quality: 'high',
    aspectRatio: '1:1',
    filters: []
  });
  const [showSettings, setShowSettings] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize camera
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, [settings.facingMode]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, maxDuration]);

  const initializeCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: settings.facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: currentMode === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsActive(true);
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      alert('Camera access denied. Please enable camera permissions.');
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions based on aspect ratio
    const aspectRatios = {
      '1:1': { width: 1080, height: 1080 },
      '4:5': { width: 1080, height: 1350 },
      '9:16': { width: 1080, height: 1920 },
      '16:9': { width: 1920, height: 1080 }
    };

    const dimensions = aspectRatios[settings.aspectRatio];
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Calculate crop area
    const videoAspect = video.videoWidth / video.videoHeight;
    const targetAspect = dimensions.width / dimensions.height;

    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;

    if (videoAspect > targetAspect) {
      // Video is wider, crop horizontally
      sw = video.videoHeight * targetAspect;
      sx = (video.videoWidth - sw) / 2;
    } else {
      // Video is taller, crop vertically
      sh = video.videoWidth / targetAspect;
      sy = (video.videoHeight - sh) / 2;
    }

    context.drawImage(video, sx, sy, sw, sh, 0, 0, dimensions.width, dimensions.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const media: CapturedMedia = {
          id: `photo-${Date.now()}`,
          type: 'photo',
          blob,
          url: URL.createObjectURL(blob),
          timestamp: new Date(),
          metadata: {
            width: dimensions.width,
            height: dimensions.height,
            size: blob.size,
            aspectRatio: settings.aspectRatio
          }
        };
        setCapturedMedia(prev => [...prev, media]);
        onCapture(media);
      }
    }, 'image/jpeg', 0.9);
  };

  const startRecording = async () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const media: CapturedMedia = {
          id: `video-${Date.now()}`,
          type: 'video',
          blob,
          url: URL.createObjectURL(blob),
          timestamp: new Date(),
          duration: recordingTime,
          metadata: {
            width: 1920,
            height: 1080,
            size: blob.size,
            aspectRatio: settings.aspectRatio
          }
        };
        setCapturedMedia(prev => [...prev, media]);
        onCapture(media);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Recording failed:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const handleCapture = () => {
    if (settings.timer > 0) {
      setCountdown(settings.timer);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            if (currentMode === 'photo') {
              capturePhoto();
            } else {
              startRecording();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (currentMode === 'photo') {
        capturePhoto();
      } else if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const switchCamera = () => {
    setSettings(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user'
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('fixed inset-0 bg-black z-50 flex flex-col', className)}>
      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {/* Grid Overlay */}
        {settings.grid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/30" />
              ))}
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-6xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-error-500 text-white px-3 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-medium">{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex items-center space-x-2">
            {/* Flash Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettings(prev => ({ ...prev, flash: !prev.flash }))}
              className={cn(
                'bg-black/50 text-white hover:bg-black/70',
                settings.flash && 'bg-warning-500 hover:bg-warning-600'
              )}
            >
              {settings.flash ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            </Button>

            {/* Grid Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettings(prev => ({ ...prev, grid: !prev.grid }))}
              className={cn(
                'bg-black/50 text-white hover:bg-black/70',
                settings.grid && 'bg-primary-500 hover:bg-primary-600'
              )}
            >
              <Grid3X3 className="w-5 h-5" />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mode Selector */}
        {mode === 'both' && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center bg-black/50 rounded-full p-1">
              <button
                onClick={() => setCurrentMode('photo')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  currentMode === 'photo'
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-white/20'
                )}
              >
                Photo
              </button>
              <button
                onClick={() => setCurrentMode('video')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  currentMode === 'video'
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-white/20'
                )}
              >
                Video
              </button>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-8 left-4 right-4">
          <div className="flex items-center justify-between">
            {/* Recent Media */}
            <div className="flex space-x-2">
              {capturedMedia.slice(-3).map((media) => (
                <div
                  key={media.id}
                  className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/50"
                >
                  {media.type === 'photo' ? (
                    <img src={media.url} alt="Captured" className="w-full h-full object-cover" />
                  ) : (
                    <video src={media.url} className="w-full h-full object-cover" muted />
                  )}
                </div>
              ))}
            </div>

            {/* Capture Button */}
            <button
              onClick={handleCapture}
              disabled={countdown > 0}
              className={cn(
                'w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all duration-200',
                isRecording 
                  ? 'bg-error-500 hover:bg-error-600 scale-110' 
                  : 'bg-white/20 hover:bg-white/30 hover:scale-105'
              )}
            >
              {countdown > 0 ? (
                <span className="text-2xl font-bold text-white">{countdown}</span>
              ) : currentMode === 'photo' ? (
                <Circle className="w-8 h-8 text-white" />
              ) : isRecording ? (
                <Square className="w-6 h-6 text-white" />
              ) : (
                <Circle className="w-8 h-8 text-white" />
              )}
            </button>

            {/* Camera Switch */}
            <Button
              variant="ghost"
              size="sm"
              onClick={switchCamera}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Timer Selector */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center bg-black/50 rounded-full p-1">
              {[0, 3, 10].map((time) => (
                <button
                  key={time}
                  onClick={() => setSettings(prev => ({ ...prev, timer: time as any }))}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-all',
                    settings.timer === time
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-white/20'
                  )}
                >
                  {time === 0 ? 'Off' : `${time}s`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-x-4 bottom-32 bg-black/90 backdrop-blur-lg rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Camera Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
              <select
                value={settings.aspectRatio}
                onChange={(e) => setSettings(prev => ({ ...prev, aspectRatio: e.target.value as any }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="1:1">Square (1:1)</option>
                <option value="4:5">Portrait (4:5)</option>
                <option value="9:16">Stories (9:16)</option>
                <option value="16:9">Landscape (16:9)</option>
              </select>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-medium mb-2">Quality</label>
              <select
                value={settings.quality}
                onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value as any }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="low">Low (Fast)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Best)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowSettings(false)}
              className="text-white hover:bg-white/20"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};