import "dotenv/config";
// Infrastructure
import { PostgresUserRepository } from "./infrastructure/database/repositories/PostgresUserRepository.js";
import { PostgresTenantRepository } from "./infrastructure/database/repositories/PostgresTenantRepository.js";
import { PostgresAppointmentRepository } from "./infrastructure/database/repositories/PostgresAppointmentRepository.js";
import { JwtTokenService } from "./infrastructure/security/JwtTokenService.js";
import { BcryptPasswordHasher } from "./infrastructure/security/BcryptPasswordHasher.js";
import { GoogleCalendarService } from "./infrastructure/external/google/GoogleCalendarService.js";
import { LlmProviderFactory } from "./infrastructure/external/ai/LlmProviderFactory.js";
import { SchedulingAIService } from "./infrastructure/external/ai/SchedulingAIService.js";
import { BaileysWhatsAppAdapter } from "./infrastructure/external/whatsapp/BaileysWhatsAppAdapter.js";
import { WhatsAppSessionManager } from "./infrastructure/external/whatsapp/WhatsAppSessionManager.js";

// Application Use Cases
import { RegisterUserUseCase } from "./application/use-cases/auth/RegisterUserUseCase.js";
import { LoginUserUseCase } from "./application/use-cases/auth/LoginUserUseCase.js";
import { GetAvailableSlotsUseCase } from "./application/use-cases/scheduling/GetAvailableSlotsUseCase.js";
import { BookAppointmentUseCase } from "./application/use-cases/scheduling/BookAppointmentUseCase.js";
import { CancelAppointmentUseCase } from "./application/use-cases/scheduling/CancelAppointmentUseCase.js";
import { ListAppointmentsUseCase } from "./application/use-cases/scheduling/ListAppointmentsUseCase.js";
import { ProcessWhatsAppMessageUseCase } from "./application/use-cases/whatsapp/ProcessWhatsAppMessageUseCase.js";

// Presentation
import { AuthController } from "./presentation/http/controllers/AuthController.js";
import { SchedulingController } from "./presentation/http/controllers/SchedulingController.js";
import { WhatsAppController } from "./presentation/http/controllers/WhatsAppController.js";
import { AuthMiddleware } from "./presentation/http/middlewares/AuthMiddleware.js";
import { createApiRouter } from "./presentation/http/routes/index.js";

// 1. Repositories & Security
const userRepository = new PostgresUserRepository();
const tenantRepository = new PostgresTenantRepository();
const appointmentRepository = new PostgresAppointmentRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();

// 2. External Services
const googleCalendarService = new GoogleCalendarService();
const whatsAppAdapter = new BaileysWhatsAppAdapter();
const llmProvider = LlmProviderFactory.createProvider(process.env.AI_PROVIDER || "gemini");

// 3. Scheduling Use Cases
const getAvailableSlotsUseCase = new GetAvailableSlotsUseCase(
  tenantRepository,
  googleCalendarService
);

const bookAppointmentUseCase = new BookAppointmentUseCase(
  tenantRepository,
  appointmentRepository,
  googleCalendarService
);

const cancelAppointmentUseCase = new CancelAppointmentUseCase(
  tenantRepository,
  appointmentRepository,
  googleCalendarService
);

const listAppointmentsUseCase = new ListAppointmentsUseCase(
  tenantRepository,
  appointmentRepository,
  googleCalendarService
);

// 4. AI Service wired to Use Cases for Google Calendar tool calling (Multi-LLM: Gemini, Claude, GPT, Groq)
const aiService = new SchedulingAIService(
  llmProvider,
  getAvailableSlotsUseCase,
  bookAppointmentUseCase,
  cancelAppointmentUseCase,
  listAppointmentsUseCase
);

// 5. WhatsApp Message Processing & Session Manager
const processWhatsAppMessageUseCase = new ProcessWhatsAppMessageUseCase(
  whatsAppAdapter,
  aiService,
  tenantRepository
);

const whatsAppSessionManager = new WhatsAppSessionManager(
  processWhatsAppMessageUseCase,
  whatsAppAdapter
);

// 6. Auth Use Cases
const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  tenantRepository,
  passwordHasher,
  tokenService
);

const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  passwordHasher,
  tokenService
);

// 7. Presentation Controllers & Middleware
const authController = new AuthController(registerUserUseCase, loginUserUseCase);
const schedulingController = new SchedulingController(
  getAvailableSlotsUseCase,
  bookAppointmentUseCase,
  cancelAppointmentUseCase,
  listAppointmentsUseCase,
  tenantRepository
);
const whatsAppController = new WhatsAppController(
  whatsAppSessionManager,
  processWhatsAppMessageUseCase
);
const authMiddleware = new AuthMiddleware(tokenService);

const apiRouter = createApiRouter(
  authController,
  schedulingController,
  whatsAppController
);

export const appContainer = {
  // Repositories
  userRepository,
  tenantRepository,
  appointmentRepository,
  // Services
  passwordHasher,
  tokenService,
  googleCalendarService,
  whatsAppAdapter,
  aiService,
  whatsAppSessionManager,
  // Use Cases
  registerUserUseCase,
  loginUserUseCase,
  getAvailableSlotsUseCase,
  bookAppointmentUseCase,
  cancelAppointmentUseCase,
  listAppointmentsUseCase,
  processWhatsAppMessageUseCase,
  // Controllers
  authController,
  schedulingController,
  whatsAppController,
  authMiddleware,
  apiRouter,
};
