"use client";
import { useEffect } from "react";
import { marcarComoLeido } from "@/lib/actions/comunicado-actions";

export default function AutoLectura({ id }: { id: number }) {
  useEffect(() => {
    marcarComoLeido(id);
  }, [id]);

  return null;
}