import "./style.css";
import createEventBus from "./@utils/EventBus.js";
import TaskModel from "./models/TaskModel.js";
import TaskView from "./views/TaskView.js";
import AppController from "./controllers/AppController.js";
import StorageService from "./@services/StorageService,js";

const bus = createEventBus();
const storage = new StorageService({ key: "taskflow", version: 1 });

const model = new TaskModel();
const view = new TaskView("#app");
const controller = new AppController({ bus, model, view, storage });

controller.init();
