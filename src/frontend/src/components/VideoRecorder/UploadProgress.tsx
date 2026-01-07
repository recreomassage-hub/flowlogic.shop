interface UploadProgressProps {
  progress: number; // 0-100
}

export function UploadProgress({ progress }: UploadProgressProps) {
  return (
    <div className="space-y-2 px-4">
      <div className="text-center">
        <p className="text-sm sm:text-base text-gray-700 font-medium">Uploading video...</p>
      </div>
      
      <div className="w-full max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Percentage Text */}
        <div className="text-center mt-2">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}

