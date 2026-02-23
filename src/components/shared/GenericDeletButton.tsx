"use client";
import { useState } from "react";
import { Trash2, LucideIcon } from "lucide-react";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { toast } from "sonner";

interface GenericDeleteProps {
  id: number | string;
  action: (id: any) => Promise<{ success: boolean; message?: string }>;
  title: string;
  message: string;
  icon?: LucideIcon;
  label?: string;
  variant?: "danger" | "warning" | "info";
}

export default function GenericDeleteButton({
  id, action, title, message, icon: Icon = Trash2, label, variant = "danger"
}: GenericDeleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const result = await action(id);
    setLoading(false);
    setIsOpen(false);

    if (result.success) {
      toast.success("Operación realizada con éxito");
    } else {
      toast.error(result.message || "Ocurrió un error inesperado");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
          variant === "danger"
            ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
            : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
        }`}
        title={title}
      >
        <Icon size={18} />
        {label && <span className="text-sm font-medium">{label}</span>}
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        title={title}
        message={message}
        variant={variant}
      />
    </>
  );
}