"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ModalContextType {
  isOpen: boolean;
  content: ReactNode | null;
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const openModal = useCallback((modalContent: ReactNode) => {
    console.log('ModalProvider openModal 호출됨:', modalContent);
    setContent(modalContent);
    setIsOpen(true);
    console.log('ModalProvider 상태 업데이트 완료');
  }, []);

  const closeModal = useCallback(() => {
    console.log('ModalProvider closeModal 호출됨');
    setIsOpen(false);
    setContent(null);
  }, []);

  return (
    <ModalContext.Provider value={{ isOpen, content, openModal, closeModal }}>
      {children}
      {isOpen && (
        <>
          {console.log('ModalProvider 렌더링 - 모달 표시:', { isOpen, content })}
          {content}
        </>
      )}
    </ModalContext.Provider>
  );
};
