import { Request, Response } from "express";

export async function handleStudentSubmissionUpdate(
  req: Request,
  res: Response,
  update: (userid: number) => Promise<unknown>
): Promise<void> {
  const user = (req as Request & { user?: { id: number; role: string } }).user;
  if (user?.role !== "student") {
    res.status(403).json({ error: "Solo el estudiante puede editar su enlace." });
    return;
  }

  try {
    const saved = await update(user.id);
    if (!saved) {
      res.status(404).json({ error: "Entrega no encontrada o ya finalizada." });
      return;
    }
    res.status(200).json(saved);
  } catch (error) {
    if (error instanceof TypeError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
}
