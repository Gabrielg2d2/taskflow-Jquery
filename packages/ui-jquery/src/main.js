import "./style.css";
import createEventBus from "./utils/EventBus.js";
import { InMemoryTaskRepository, TaskApplicationService } from "@taskflow/core";
import { LocalStorageAdapter, CryptoIdGenerator, BrowserRouter } from "@taskflow/infrastructure";
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

controller.init();
