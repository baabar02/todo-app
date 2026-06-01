import { Router, Response } from "express";
import prisma from "../prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// GET all todos for logged in user
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// POST create a new todo
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { title } = (req as any).body;
  try {
    const todo = await prisma.todo.create({
      data: {
        title,
        userId: req.userId!,
      },
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// PUT update a todo (toggle complete or edit title)
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  try {
    const todo = await prisma.todo.update({
      where: { id, userId: req.userId },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
      },
    });
    console.log(req.body, "Request body for updating todo");
    
    console.log(todo, "Todo updated successfully");

    res.json(todo);
  } catch (error) {
    console.log(error); 
    res.status(500).json({ message: "Something went wrong in put" });
  }
});

// DELETE a todo
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = (req as any).params;
  try {
    await prisma.todo.delete({
      where: { id, userId: req.userId },
    });
    res.json({ message: "Todo deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
