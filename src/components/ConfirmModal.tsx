"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, message = "Bạn có chắc muốn xóa?", onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border-notion rounded-3xl p-8 shadow-2xl w-full max-w-sm mx-4"
          >
            <div className="w-12 h-12 bg-error/10 rounded-2xl flex items-center justify-center mb-6">
              <Trash2 size={22} className="text-error" />
            </div>
            <h3 className="text-lg font-black text-accent mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-foreground/40 font-medium mb-8">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-5 py-2 text-foreground/40 font-bold text-sm hover:text-accent transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                className="bg-error text-background px-6 py-2 rounded-xl font-black text-sm shadow-lg hover:opacity-90 transition-all"
              >
                Xóa
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
