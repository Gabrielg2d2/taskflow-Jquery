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
        this.view.clearForm();
      });
  
      // 2) View -> Controller -> Model
      this.view.bindTaskActions({
        onToggle: (id) => this.model.toggleTask(id),
        onRemove: (id) => this.model.removeTask(id),
      });
  
      // 3) Model -> Controller -> View (reatividade)
      this.bus.on("tasks:changed", (state) => {
        this.view.render(state);
      });
  
      // 4) primeiro render
      this.view.render(this.model.getState());
    }
  }
  