# TaskFlow

Um gerenciador de tarefas construído com **Clean Architecture**, demonstrando como criar uma aplicação **agnóstica a framework** que pode rodar com jQuery, React, Vue ou qualquer outra tecnologia de UI.

## Visão Geral

Este projeto é um **monorepo** que separa completamente a lógica de negócio da interface do usuário. A mesma camada de domínio é compartilhada entre duas implementações de UI diferentes:

- **jQuery** - Implementação vanilla com jQuery
- **React** - Implementação moderna com React 19

## Demonstração

```bash
# Rodar jQuery (porta 3001)
npm run dev:jquery

# Rodar React (porta 3002)
npm run dev:react

# Rodar ambos simultaneamente
npm run dev:all
```

## Arquitetura

O projeto segue os princípios de **Clean Architecture** e **Hexagonal Architecture (Ports & Adapters)**:

```
┌─────────────────────────────────────────────────────────────┐
│                           UI Layer                           │
│                    (jQuery / React / Vue)                    │
│         Específico de framework - MUDA por tecnologia        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│                   TaskApplicationService                     │
│                                                              │
│   Orquestra use cases e define interfaces (ports)            │
│   NUNCA muda quando troca de framework                       │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌───────────────────────┐       ┌───────────────────────────┐
│     Domain Layer      │       │   Infrastructure Layer    │
│                       │       │                           │
│  • Entities (Task)    │       │  • LocalStorageAdapter    │
│  • Value Objects      │       │  • BrowserRouter          │
│  • Use Cases          │       │  • CryptoIdGenerator      │
│  • Repository Interface│      │  • ApiGateway (futuro)    │
│                       │       │                           │
│  NÚCLEO - Nunca muda  │       │  Implementações concretas │
└───────────────────────┘       └───────────────────────────┘
```

## Estrutura do Monorepo

```
taskflow/
├── package.json                     # Workspace root
├── vitest.config.js                 # Testes (config raiz)
│
└── packages/
    │
    ├── core/                        # @taskflow/core
    │   ├── package.json
    │   ├── vitest.config.js
    │   └── src/
    │       ├── domain/
    │       │   ├── entities/
    │       │   │   └── Task.js              # Entidade Task
    │       │   ├── value-objects/
    │       │   │   └── TaskTitle.js         # Validação de título
    │       │   ├── repositories/
    │       │   │   ├── ITaskRepository.js   # Interface
    │       │   │   └── InMemoryTaskRepository.js
    │       │   └── use-cases/
    │       │       ├── AddTask.js
    │       │       ├── ToggleTask.js
    │       │       ├── RemoveTask.js
    │       │       ├── EditTask.js
    │       │       ├── ClearAllTasks.js
    │       │       ├── FilterTasks.js
    │       │       └── GetTasksState.js
    │       │
    │       └── application/
    │           ├── TaskApplicationService.js  # Fachada principal
    │           └── ports/
    │               ├── IStoragePort.js        # Interface storage
    │               ├── IIdGenerator.js        # Interface ID
    │               └── IRouter.js             # Interface router
    │
    ├── infrastructure/              # @taskflow/infrastructure
    │   ├── package.json
    │   └── src/
    │       ├── storage/
    │       │   └── LocalStorageAdapter.js
    │       ├── router/
    │       │   └── BrowserRouter.js
    │       └── id-generator/
    │           └── CryptoIdGenerator.js
    │
    ├── ui-jquery/                   # @taskflow/ui-jquery
    │   ├── package.json
    │   ├── vite.config.js
    │   ├── vitest.config.js
    │   ├── index.html
    │   └── src/
    │       ├── main.js
    │       ├── TaskView.js
    │       ├── TaskController.js
    │       └── utils/
    │
    └── ui-react/                    # @taskflow/ui-react
        ├── package.json
        ├── vite.config.js
        ├── vitest.config.js
        ├── index.html
        └── src/
            ├── main.jsx
            ├── App.jsx
            ├── hooks/
            │   └── useTaskService.js
            └── components/
                ├── TaskHeader.jsx
                ├── TaskForm.jsx
                ├── TaskToolbar.jsx
                ├── TaskList.jsx
                ├── TaskItem.jsx
                └── Toast.jsx
```

## Camadas em Detalhe

### Domain Layer (`@taskflow/core`)

O **núcleo da aplicação** - contém toda a lógica de negócio. Esta camada:

- ✅ É 100% JavaScript puro
- ✅ Não depende de DOM, browser ou framework
- ✅ Pode ser testada isoladamente
- ✅ Nunca muda quando você troca de UI

#### Entidades

```javascript
// Task é imutável - métodos retornam nova instância
const task = new Task({ id: "1", title: "Estudar", done: false });
const toggled = task.toggle();  // Nova task com done: true
```

#### Use Cases

Cada operação de negócio é um use case isolado:

```javascript
// Adicionar tarefa
const addTask = new AddTaskUseCase({ taskRepository, idGenerator });
const result = addTask.execute("Minha tarefa");

if (result.ok) {
  console.log("Tarefa criada:", result.task);
} else {
  console.log("Erro:", result.code); // TASK_EMPTY, TASK_DUPLICATE
}
```

### Application Layer (`@taskflow/core`)

Orquestra os use cases e define as **interfaces (ports)** que a infraestrutura deve implementar:

```javascript
// TaskApplicationService é a fachada principal
const taskService = new TaskApplicationService({
  taskRepository,  // implementa ITaskRepository
  idGenerator,     // implementa IIdGenerator
  storage,         // implementa IStoragePort
});

// API simples para a UI
taskService.addTask("Nova tarefa");
taskService.toggleTask(id);
taskService.getState(); // { tasks: [...], stats: { total, done, pending } }
```

### Infrastructure Layer (`@taskflow/infrastructure`)

Implementações concretas das interfaces definidas na Application:

| Interface | Implementação | Descrição |
|-----------|---------------|-----------|
| `IStoragePort` | `LocalStorageAdapter` | Persiste no localStorage |
| `IIdGenerator` | `CryptoIdGenerator` | Usa `crypto.randomUUID()` |
| `IRouter` | `BrowserRouter` | Usa History API |

### UI Layer (`ui-jquery` / `ui-react`)

Cada UI é um **package independente** que:

- Importa `@taskflow/core` e `@taskflow/infrastructure`
- Implementa a renderização específica do framework
- Conecta eventos de usuário aos métodos do `TaskApplicationService`

## Fluxo de Dados

```
┌──────────┐     ┌────────────┐     ┌─────────────────┐     ┌────────────┐
│  Usuário │────▶│    View    │────▶│   Controller    │────▶│  Service   │
│  clica   │     │  (jQuery/  │     │  (orquestra)    │     │ Application│
│          │     │   React)   │     │                 │     │            │
└──────────┘     └────────────┘     └─────────────────┘     └─────┬──────┘
                                                                   │
                       ┌───────────────────────────────────────────┘
                       ▼
              ┌─────────────────┐     ┌──────────────────┐
              │    Use Case     │────▶│   Repository     │
              │  (AddTask, etc) │     │  (InMemory)      │
              └─────────────────┘     └──────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    Storage      │
              │ (localStorage)  │
              └─────────────────┘
```

### Exemplo: Adicionar Tarefa

1. **Usuário** digita título e clica "Adicionar"
2. **View** captura evento e chama `controller.onAdd(title)`
3. **Controller** chama `taskService.addTask(title)`
4. **TaskApplicationService** executa `AddTaskUseCase`
5. **AddTaskUseCase** valida, cria Task e salva no Repository
6. **Controller** chama `taskService.saveToStorage()`
7. **Controller** emite evento `tasks:changed`
8. **View** re-renderiza com novo estado

## API Gateway (Extensão Futura)

Para comunicação com APIs REST, adicione um Gateway:

```javascript
// application/ports/ITaskApiGateway.js
export class ITaskApiGateway {
  async fetchAll() { throw new Error("Not implemented"); }
  async create(task) { throw new Error("Not implemented"); }
  async update(id, data) { throw new Error("Not implemented"); }
  async delete(id) { throw new Error("Not implemented"); }
}
```

```javascript
// infrastructure/api/TaskApiGateway.js
export class TaskApiGateway extends ITaskApiGateway {
  constructor({ baseUrl, token }) {
    this.baseUrl = baseUrl;
    this.headers = { Authorization: `Bearer ${token}` };
  }

  async fetchAll() {
    const res = await fetch(`${this.baseUrl}/tasks`, { headers: this.headers });
    return res.json();
  }

  async create(task) {
    const res = await fetch(`${this.baseUrl}/tasks`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    return res.json();
  }
}
```

## Comandos Disponíveis

### Desenvolvimento

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia jQuery (padrão) |
| `npm run dev:jquery` | Inicia jQuery na porta 3001 |
| `npm run dev:react` | Inicia React na porta 3002 |
| `npm run dev:all` | Inicia ambos simultaneamente |

### Build

| Comando | Descrição |
|---------|-----------|
| `npm run build` | Build de todos os packages |
| `npm run build:jquery` | Build apenas jQuery |
| `npm run build:react` | Build apenas React |

### Testes

| Comando | Descrição |
|---------|-----------|
| `npm test` | Roda todos os testes |
| `npm run test:watch` | Modo watch |
| `npm run test:ui` | Interface visual Vitest |
| `npm run test:coverage` | Relatório de cobertura |
| `npm run test:core` | Testes do `@taskflow/core` |
| `npm run test:react` | Testes do `@taskflow/ui-react` |
| `npm run test:jquery` | Testes do `@taskflow/ui-jquery` |

## Dependências entre Packages

```
ui-jquery ─────┐
               ├──▶ infrastructure ──▶ core
ui-react ──────┘
```

- **core**: Zero dependências externas (JS puro)
- **infrastructure**: Depende apenas de `core`
- **ui-jquery**: Depende de `core`, `infrastructure` e `jquery`
- **ui-react**: Depende de `core`, `infrastructure` e `react`

## Por Que Esta Arquitetura?

### Benefícios

| Benefício | Descrição |
|-----------|-----------|
| **Testabilidade** | Domain e Application são 100% testáveis sem DOM |
| **Manutenibilidade** | Mudanças na UI não afetam lógica de negócio |
| **Flexibilidade** | Trocar jQuery por React? Só criar nova pasta em `ui/` |
| **Onboarding** | Novos devs entendem a separação claramente |
| **Reuso** | Mesma lógica pode virar app mobile, CLI, etc |

### Quando NÃO Usar

- Projetos muito pequenos (overhead de estrutura)
- Protótipos descartáveis
- Time sem familiaridade com Clean Architecture

## Adicionar Nova UI (ex: Vue)

1. Crie `packages/ui-vue/`
2. Configure `package.json` com dependências de Vue
3. Importe `@taskflow/core` e `@taskflow/infrastructure`
4. Implemente componentes Vue que usam `TaskApplicationService`
5. Adicione scripts no `package.json` raiz

```javascript
// packages/ui-vue/src/composables/useTaskService.js
import { ref, computed } from 'vue';
import { TaskApplicationService } from '@taskflow/core';
import { LocalStorageAdapter, CryptoIdGenerator } from '@taskflow/infrastructure';

export function useTaskService() {
  // Mesma lógica, só muda a reatividade para Vue
}
```

## Tecnologias

- **Vite** - Build tool
- **Vitest** - Test runner
- **Tailwind CSS** - Estilização
- **npm Workspaces** - Monorepo

## Licença

MIT

---

Desenvolvido como estudo de **Clean Architecture** aplicada a aplicações frontend.
