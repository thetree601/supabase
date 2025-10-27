"use client";

import React, { useState, useCallback } from "react";
import { useAuthGuard } from "../../../commons/providers/auth/auth.guard.hook";
import { useModal } from "../../../commons/providers/modal/modal.provider";
import { Modal } from "../../../commons/components/modal";
import { Emotion } from "../../../commons/constants/enum";

export interface Diary {
  id: number;
  title: string;
  content: string;
  emotion: Emotion;
  createdAt: string;
}

export const useDiaryDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { checkPermission } = useAuthGuard();
  const { openModal, closeModal } = useModal();

  const handleDeleteCancel = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleDeleteConfirm = useCallback(
    (diaryId: number) => {
      if (isDeleting) return;
      setIsDeleting(true);
      try {
        const diariesData = localStorage.getItem("diaries");
        if (!diariesData) {
          console.error("일기 데이터를 찾을 수 없습니다.");
          return;
        }
        const diaries: Diary[] = JSON.parse(diariesData);
        const updatedDiaries = diaries.filter((diary) => diary.id !== diaryId);
        localStorage.setItem("diaries", JSON.stringify(updatedDiaries));
        closeModal();
        window.dispatchEvent(
          new CustomEvent("diaryDeleted", {
            detail: { deletedId: diaryId },
          })
        );
      } catch (error) {
        console.error("일기 삭제 중 오류가 발생했습니다:", error);
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting, closeModal]
  );

  const showDeleteConfirmModal = useCallback(
    (diaryId: number) => {
      const modalContent = React.createElement(Modal, {
        isOpen: true,
        onClose: handleDeleteCancel,
        variant: "danger",
        actions: "dual",
        title: "일기 삭제",
        content: "일기를 삭제 하시겠어요?",
        dualActionFirstText: "취소",
        dualActionSecondText: "삭제",
        onDualActionFirst: handleDeleteCancel,
        onDualActionSecond: () => handleDeleteConfirm(diaryId),
      });

      openModal(modalContent);
    },
    [openModal, handleDeleteConfirm, handleDeleteCancel]
  );

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent, diaryId: number) => {
      event.stopPropagation();
      event.preventDefault();

      if (!checkPermission()) {
        return;
      }

      showDeleteConfirmModal(diaryId);
    },
    [checkPermission, showDeleteConfirmModal]
  );

  return {
    handleDeleteClick,
    isDeleting,
  } as const;
};
