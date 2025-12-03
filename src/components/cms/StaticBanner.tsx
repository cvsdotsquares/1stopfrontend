'use client';

interface StaticBannerProps {
  backgroundImage?: string;
  title: string;
  caption?: string;
  overlayText?: string;
  showOverlay?: boolean;
  className?: string;
}

export default function StaticBanner({
  backgroundImage,
  title,
  caption,
  overlayText,
  showOverlay = false,
  className = ''
}: StaticBannerProps) {
  return (
    <div className={`relative h-[400px] overflow-hidden ${className}`}>
      {/* Background Image */}
      {backgroundImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
          {caption && (
            <p className="text-xl md:text-2xl mb-6 opacity-90">{caption}</p>
          )}
          {showOverlay && overlayText && (
            <div className="bg-black/60 backdrop-blur-sm px-6 py-4 rounded-lg inline-block">
              <p className="text-lg" dangerouslySetInnerHTML={{ __html: overlayText }} />
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}