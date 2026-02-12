import "./style.css";
import createEventBus from "./@utils/EventBus.js";
import TaskModel from "./models/TaskModel.js";
import TaskView from "./views/TaskView.js";
import AppController from "./controllers/AppController.js";

const bus = createEventBus();
const model = new TaskModel();
const view = new TaskView("#app");
const controller = new AppController({ bus, model, view });

controller.init();
