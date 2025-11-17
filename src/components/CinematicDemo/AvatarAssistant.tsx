import React, { useState, useEffect } from 'react';
import { cn } from '../../design-system/utils/cn';
import { Sparkles, Volume2, VolumeX, MessageCircle, X } from 'lucide-react';

interface AvatarAssistantProps {
  action?: 'intro' | 'point' | 'celebrate' | 'explain' | 'idle';
  speech?: string;
  variant?: 'realistic' | 'stylized';
  position?: 'bottom-right' | 'bottom-left' | 'center';
  size?: 'sm' | 'md' | 'lg';
  autoSpeak?: boolean;
  onClose?: () => void;
}

export const AvatarAssistant: React.FC<AvatarAssistantProps> = ({
  action = 'idle',
  speech,
  variant = 'stylized',
  position = 'bottom-right',
  size = 'md',
  autoSpeak = true,
  onClose
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<'happy' | 'thinking' | 'excited' | 'neutral'>('happy');

  useEffect(() => {
    if (speech && autoSpeak) {
      setShowBubble(true);
      setIsSpeaking(true);

      const speakTimeout = setTimeout(() => {
        setIsSpeaking(false);
      }, speech.length * 50);

      return () => clearTimeout(speakTimeout);
    }
  }, [speech, autoSpeak]);

  useEffect(() => {
    switch (action) {
      case 'intro':
        setCurrentExpression('excited');
        break;
      case 'explain':
        setCurrentExpression('thinking');
        break;
      case 'celebrate':
        setCurrentExpression('excited');
        break;
      case 'point':
        setCurrentExpression('happy');
        break;
      default:
        setCurrentExpression('neutral');
    }
  }, [action]);

  const getPositionClass = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-6 right-6';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-16 h-16';
      case 'md':
        return 'w-24 h-24';
      case 'lg':
        return 'w-32 h-32';
      default:
        return 'w-24 h-24';
    }
  };

  const getGestureAnimation = () => {
    switch (action) {
      case 'intro':
        return 'animate-wave';
      case 'point':
        return 'animate-point';
      case 'celebrate':
        return 'animate-celebrate';
      case 'explain':
        return 'animate-talk';
      default:
        return 'animate-bob';
    }
  };

  const StylizedAvatar = () => (
    <div className={cn('relative', getSizeClass())}>
      <div className={cn(
        'w-full h-full rounded-full flex items-center justify-center transition-all duration-300',
        getGestureAnimation(),
        variant === 'stylized' && 'bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 shadow-2xl'
      )}>
        <div className="relative w-full h-full flex items-center justify-center">
          <Sparkles className={cn(
            'w-1/2 h-1/2 text-white transition-transform duration-300',
            isSpeaking && 'scale-110'
          )} />

          {isSpeaking && (
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
          )}

          <div className="absolute -top-1 -right-1 w-6 h-6 bg-success-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {currentExpression === 'happy' && (
        <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white rounded-full" />
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <div className="w-6 h-3 bg-white rounded-b-full mt-1 mx-auto" />
        </div>
      )}
    </div>
  );

  const RealisticAvatar = () => (
    <div className={cn('relative', getSizeClass())}>
      <div className={cn(
        'w-full h-full rounded-full overflow-hidden shadow-2xl ring-4 ring-white',
        getGestureAnimation()
      )}>
        <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
          <div className="relative w-full h-full">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="url(#avatarGradient)" />

              <circle cx="35" cy="45" r="3" fill="#1F2937" />
              <circle cx="65" cy="45" r="3" fill="#1F2937" />

              {currentExpression === 'happy' && (
                <path d="M 35 60 Q 50 70 65 60" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
              )}

              {currentExpression === 'thinking' && (
                <>
                  <path d="M 35 60 L 65 60" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="75" cy="40" r="2" fill="#1F2937" opacity="0.5" />
                  <circle cx="80" cy="35" r="2.5" fill="#1F2937" opacity="0.5" />
                  <circle cx="85" cy="30" r="3" fill="#1F2937" opacity="0.5" />
                </>
              )}

              {currentExpression === 'excited' && (
                <>
                  <circle cx="35" cy="45" r="4" fill="#1F2937" />
                  <circle cx="65" cy="45" r="4" fill="#1F2937" />
                  <ellipse cx="50" cy="62" rx="12" ry="8" fill="#1F2937" />
                </>
              )}

              <path d="M 30 35 Q 35 32 40 35" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 60 35 Q 65 32 70 35" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />

              <path d="M 20 40 Q 25 20 50 15 Q 75 20 80 40" fill="url(#hairGradient)" />

              <defs>
                <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F3E5D8" />
                  <stop offset="100%" stopColor="#E8D4C0" />
                </linearGradient>
                <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4B5563" />
                  <stop offset="100%" stopColor="#374151" />
                </linearGradient>
              </defs>
            </svg>

            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-primary-500/50 animate-ping" />
            )}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
    </div>
  );

  return (
    <div className={cn('fixed z-50', getPositionClass())}>
      <div className="relative">
        {showBubble && speech && (
          <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 animate-slide-up">
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-xs">
              <div className="flex items-start space-x-3">
                <MessageCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-900 leading-relaxed">{speech}</p>
                <button
                  onClick={() => setShowBubble(false)}
                  className="p-1 hover:bg-neutral-100 rounded transition-colors flex-shrink-0"
                >
                  <X className="w-3 h-3 text-neutral-500" />
                </button>
              </div>

              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white" />
              </div>

              {isSpeaking && (
                <div className="mt-2 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        )}

        {variant === 'stylized' ? <StylizedAvatar /> : <RealisticAvatar />}

        <div className="absolute -bottom-1 -right-1 flex items-center space-x-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-neutral-50 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3 text-neutral-600" />
            ) : (
              <Volume2 className="w-3 h-3 text-neutral-600" />
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-neutral-50 transition-colors"
              title="Close"
            >
              <X className="w-3 h-3 text-neutral-600" />
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        @keyframes point {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(5deg); }
          75% { transform: scale(1.1) rotate(-5deg); }
        }
        @keyframes talk {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-wave {
          animation: wave 2s ease-in-out infinite;
        }
        .animate-point {
          animation: point 1s ease-in-out infinite;
        }
        .animate-celebrate {
          animation: celebrate 0.6s ease-in-out infinite;
        }
        .animate-talk {
          animation: talk 0.3s ease-in-out infinite;
        }
        .animate-bob {
          animation: bob 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 10px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
