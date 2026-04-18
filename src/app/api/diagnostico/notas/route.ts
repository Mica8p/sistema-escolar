import { auth } from "@/auth";
import { diagnosticarNotasPendientes } from "@/lib/diagnostico-notas";

export async function GET(request: Request) {
  try {
    const session = await auth();

    // Verificación: Usuario autenticado (permite ADMIN, DOCENTE, PADRE)
    if (!session?.user?.idUsuario) {
      return Response.json(
        { error: "Debes estar autenticado para ejecutar diagnósticos" },
        { status: 403 }
      );
    }

    // Obtener ID del profesor desde query params
    const { searchParams } = new URL(request.url);
    const idProfesor = searchParams.get("idProfesor");

    if (!idProfesor) {
      return Response.json(
        { error: "Falta parámetro: idProfesor" },
        { status: 400 }
      );
    }

    // Ejecutar diagnóstico
    await diagnosticarNotasPendientes(Number(idProfesor));

    return Response.json({
      success: true,
      message: "Diagnóstico ejecutado. Revisa la consola del servidor.",
    });
  } catch (error) {
    console.error("Error en endpoint de diagnóstico:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
