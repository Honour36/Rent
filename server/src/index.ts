import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import ownersRoutes from './routes/owners.routes';
import propertiesRoutes from './routes/properties.routes';
import unitsRoutes from './routes/units.routes';
import tenantsRoutes from './routes/tenants.routes';
import applicationsRoutes from './routes/applications.routes';
import { tenanciesRoutes } from './routes/tenancies.routes';
import paymentsRoutes from './routes/payments.routes';
import receiptsRoutes from './routes/receipts.routes';
import communicationsRoutes from './routes/communications.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import reportsRoutes from './routes/reports.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { agentsRoutes } from './routes/agents.routes';
import { settingsRoutes } from './routes/settings.routes';
import storageRoutes from './routes/storage.routes';
import notificationsRoutes from './routes/notifications.routes';
import rentCollectionRoutes from './routes/rent-collection.routes';
import depositsRoutes from './routes/deposits.routes';
import inspectionsRoutes from './routes/inspections.routes';
import { startRentRemindersJob } from './jobs/rent-reminders.job';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/owners', ownersRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/tenancies', tenanciesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/agents', agentsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/rent-collection', rentCollectionRoutes);
app.use('/api/deposits', depositsRoutes);
app.use('/api/inspections', inspectionsRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start scheduled jobs
startRentRemindersJob();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
