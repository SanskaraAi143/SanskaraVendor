import React from 'react';

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Zm0 12.5a4.5 4.5 0 0 1-4.5-4.5V5a4.5 4.5 0 0 1 9 0v6a4.5 4.5 0 0 1-4.5 4.5Z" />
    <path d="M19 11a1 1 0 0 0-2 0a6 6 0 0 1-12 0 1 1 0 0 0-2 0a8 8 0 0 0 7 7.93V21a1 1 0 0 0 2 0v-2.07A8 8 0 0 0 19 11Z" />
  </svg>
);

export const WifiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 4.6a1 1 0 0 0-.7.3l-.1.1a1 1 0 0 0 0 1.4L12 7.2l.8-.8a1 1 0 0 0 0-1.4l-.1-.1a1 1 0 0 0-.7-.2Z" />
    <path d="M12 10a1 1 0 0 0-.7.3l-.1.1a1 1 0 0 0 0 1.4l.8.8.8-.8a1 1 0 0 0 0-1.4l-.1-.1a1 1 0 0 0-.7-.2Z" />
    <path d="M12.7 15.1a1 1 0 0 0-1.4 0l-.1.1a1 1 0 0 0 0 1.4l.8.8.8-.8a1 1 0 0 0 0-1.4Z" />
    <path d="M21.7 8.3a1 1 0 0 0-1.4 0l-.1.1a1 1 0 0 0 0 1.4l1.2 1.3c2.4 2.4 2.4 6.4 0 8.8a1 1 0 0 0 0 1.4l.1.1a1 1 0 0 0 1.4 0c3.2-3.2 3.2-8.3 0-11.5Z" />
    <path d="M3.7 8.3a1 1 0 0 0-1.4 1.4c3.2 3.2 3.2 8.3 0 11.5a1 1 0 0 0 0 1.4l.1.1a1 1 0 0 0 1.4 0l.1-.1a1 1 0 0 0 0-1.4l-1.2-1.3c-2.4-2.4-2.4-6.4 0-8.8a1 1 0 0 0 0-1.4Z" />
    <path d="M18.8 11.2a1 1 0 0 0-1.4 1.4c1.6 1.6 1.6 4.1 0 5.7a1 1 0 0 0 0 1.4l.1.1a1 1 0 0 0 1.4 0c2.4-2.4 2.4-6.4 0-8.6Z" />
    <path d="M6.6 11.2a1 1 0 0 0-1.4 0c-2.4 2.4-2.4 6.3 0 8.7a1 1 0 0 0 1.4 0l.1-.1a1 1 0 0 0 0-1.4c-1.6-1.6-1.6-4.1 0-5.7a1 1 0 0 0 0-1.4Z" />
  </svg>
);

export const StopCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 8.25a.75.75 0 0 0-.75.75v6c0 .414.336.75.75.75h6a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-.75-.75H9Z"
        clipRule="evenodd"
      />
    </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 16.5a1 1 0 0 1-1-1V9.7l-3.3 3.3a1 1 0 0 1-1.4-1.4l5-5a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1-1.4 1.4L13 9.7V15.5a1 1 0 0 1-1 1Z" />
    <path d="M19 21H5a3 3 0 0 1-3-3V11a1 1 0 0 1 2 0v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7a1 1 0 0 1 2 0v7a3 3 0 0 1-3 3Z" />
  </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 16a1 1 0 0 1-1-1V5a1 1 0 0 1 2 0v10a1 1 0 0 1-1 1Z" />
    <path d="m16.3 12.7-3.3 3.3-3.3-3.3a1 1 0 0 0-1.4 1.4l5 5a1 1 0 0 0 1.4 0l5-5a1 1 0 0 0-1.4-1.4Z" />
    <path d="M19 21H5a3 3 0 0 1-3-3v-7a1 1 0 0 1 2 0v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7a1 1 0 0 1 2 0v7a3 3 0 0 1-3 3Z" />
  </svg>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}>
        <path
            fillRule="evenodd"
            d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd" />
    </svg>
);

export const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}>
      <path
          fillRule="evenodd"
          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
          clipRule="evenodd" />
  </svg>
);

export const DocumentPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}>
      <path
          fillRule="evenodd"
          d="M7.5 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V6Zm3-1.5A1.5 1.5 0 0 0 9 6v12a1.5 1.5 0 0 0 1.5 1.5h6A1.5 1.5 0 0 0 18 18V6a1.5 1.5 0 0 0-1.5-1.5h-6ZM6 6.75A.75.75 0 0 1 6.75 6H7.5v12H6.75A.75.75 0 0 1 6 18V6.75Z"
          clipRule="evenodd" />
      <path d="M11.25 10.5a.75.75 0 0 0-1.5 0v.75H9a.75.75 0 0 0 0 1.5h.75v.75a.75.75 0 0 0 1.5 0v-.75H12a.75.75 0 0 0 0-1.5h-.75v-.75Z" />
  </svg>
);
