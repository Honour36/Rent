import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { agentsService, InviteAgentSchema, UpdateAgentSchema } from '../services/agents.service';

export class AgentsController {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await agentsService.list(req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }

  async invite(req: AuthRequest, res: Response) {
    try {
      const body = InviteAgentSchema.parse(req.body);
      const data = await agentsService.invite(body, req.user!);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({
        success: false,
        error: error.message || 'Invalid request'
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const body = UpdateAgentSchema.parse(req.body);
      const data = await agentsService.update(id, body, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({
        success: false,
        error: error.message || 'Invalid request'
      });
    }
  }
}

export const agentsController = new AgentsController();
