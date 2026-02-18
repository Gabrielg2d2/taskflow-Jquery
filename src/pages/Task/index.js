import createEventBus from "../../@utils/EventBus.js";
import TaskController from "./ControllerV2.js";
import TaskModel from "./Model.js";
import TaskView from "./View.js";
import StorageService from "../../@services/StorageService,js";

const bus = createEventBus();
const storage = new StorageService({ key: "taskflow", version: 1 });

const model = new TaskModel();
const view = new TaskView("#app");
const controller = new TaskController({ bus, model, view, storage });

export default controller;