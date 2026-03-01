import createEventBus from "../../@utils/EventBus.js";
import { InMemoryTaskRepository } from "../../domain/repositories/InMemoryTaskRepository.js";
import { TaskApplicationService } from "../../application/TaskApplicationService.js";
import { LocalStorageAdapter } from "../../infrastructure/storage/LocalStorageAdapter.js";
import { CryptoIdGenerator } from "../../infrastructure/id-generator/CryptoIdGenerator.js";
import { BrowserRouter } from "../../infrastructure/router/BrowserRouter.js";
import TaskView from "./TaskView.js";
import TaskController from "./TaskController.js";

const bus = createEventBus();

const taskRepository = new InMemoryTaskRepository();
const idGenerator = new CryptoIdGenerator();
const storage = new LocalStorageAdapter({ key: "taskflow", version: 1 });
const router = new BrowserRouter();

const taskService = new TaskApplicationService({
  taskRepository,
  idGenerator,
  storage,
});

const view = new TaskView("#app");

const controller = new TaskController({
  taskService,
  view,
  router,
  bus,
});

export default controller;
