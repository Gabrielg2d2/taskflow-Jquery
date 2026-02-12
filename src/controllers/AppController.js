export default class AppController {
    constructor({ bus, model, view }) {
      this.bus = bus;
      this.model = model;
      this.view = view;
    }
  
    init() {
      // 1) View -> Controller -> Model
      this.view.bindAddTask((title) => {
        if (!title) return; // validação mínima
        this.model.addTask(title);
        this.view.resetTaskForm();
        this.bus.emit("tasks:changed", this.model.getState());
      });
  
      // 2) View -> Controller -> Model
      this.view.bindTaskActions({
        onToggle: (id) => {
          this.model.toggleTask(id);
          this.bus.emit("tasks:changed", this.model.getState());
        },
        onRemove: (id) => {
          this.model.removeTask(id);
          this.bus.emit("tasks:changed", this.model.getState());
        },
      });
  
      // 3) Model -> Controller -> View (reatividade)
      this.bus.on("tasks:changed", (state) => {
        this.view.renderTaskList(state);
      });
  
      // 4) primeiro render
      this.view.renderTaskList(this.model.getState());
    }
  }
  