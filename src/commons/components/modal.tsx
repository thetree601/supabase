import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  variant?: 'danger' | 'warning' | 'info';
  actions?: 'single' | 'dual';
  title?: string;
  content?: string;
  dualActionFirstText?: string;
  dualActionSecondText?: string;
  onDualActionFirst?: () => void;
  onDualActionSecond?: () => void;
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  variant = 'info',
  actions = 'single',
  title,
  content,
  dualActionFirstText,
  dualActionSecondText,
  onDualActionFirst,
  onDualActionSecond
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        {title && (
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
        )}
        {content && (
          <p className="text-gray-600 mb-6">{content}</p>
        )}
        {actions === 'dual' && dualActionFirstText && dualActionSecondText && (
          <div className="flex gap-2 justify-end">
            <button
              onClick={onDualActionFirst}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {dualActionFirstText}
            </button>
            <button
              onClick={onDualActionSecond}
              className={`px-4 py-2 rounded-md text-white ${
                variant === 'danger' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {dualActionSecondText}
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
