export function LoadingSpinner({
  message = 'Fetching weather data...',
}: {
  message?: string
}) {
  return (
    <div className='flex min-h-[40vh] flex-col items-center justify-center gap-4'>
      <div className='relative h-14 w-14'>
        <div className='absolute inset-0 animate-spin rounded-full border-4 border-border border-t-primary' />
        <span className='absolute inset-0 flex items-center justify-center text-2xl'>
          🌤️
        </span>
      </div>
      <p className='text-sm text-muted-foreground'>{message}</p>
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className='flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center'>
      <span className='text-4xl'>⚠️</span>
      <p className='text-base font-medium text-foreground'>
        Something went wrong
      </p>
      <p className='max-w-sm text-sm text-muted-foreground'>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80'
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export function GPSPrompt() {
  return (
    <div className='flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center'>
      <span className='text-5xl'>📍</span>
      <p className='text-lg font-semibold'>Detecting your location…</p>
      <p className='max-w-xs text-sm text-muted-foreground'>
        Please allow location access for accurate local weather. If denied,
        Delhi will be used as default.
      </p>
    </div>
  )
}
