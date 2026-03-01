# Implementação React (Exemplo)

Este é um exemplo de como você implementaria a UI usando React,
reutilizando toda a camada de domínio e aplicação.

## Arquivos necessários

```
ui/react/
├── App.jsx
├── hooks/
│   └── useTaskService.js
├── components/
│   ├── TaskHeader.jsx
│   ├── TaskForm.jsx
│   ├── TaskList.jsx
│   ├── TaskItem.jsx
│   ├── TaskToolbar.jsx
│   └── Toast.jsx
└── index.jsx
```

## Exemplo de implementação

### hooks/useTaskService.js

```javascript
import { useState, useCallback, useMemo } from 'react';
import { InMemoryTaskRepository } from '../../../domain/repositories/InMemoryTaskRepository.js';
import { TaskApplicationService } from '../../../application/TaskApplicationService.js';
import { LocalStorageAdapter } from '../../../infrastructure/storage/LocalStorageAdapter.js';
import { CryptoIdGenerator } from '../../../infrastructure/id-generator/CryptoIdGenerator.js';

export function useTaskService() {
  const taskService = useMemo(() => {
    const taskRepository = new InMemoryTaskRepository();
    const idGenerator = new CryptoIdGenerator();
    const storage = new LocalStorageAdapter({ key: 'taskflow', version: 1 });

    const service = new TaskApplicationService({
      taskRepository,
      idGenerator,
      storage,
    });

    service.loadFromStorage();
    return service;
  }, []);

  const [state, setState] = useState(() => taskService.getState());
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const refreshState = useCallback(() => {
    setState(taskService.getState());
  }, [taskService]);

  const addTask = useCallback((title) => {
    const result = taskService.addTask(title);
    if (result.ok) {
      taskService.saveToStorage();
      refreshState();
    }
    return result;
  }, [taskService, refreshState]);

  const toggleTask = useCallback((id) => {
    taskService.toggleTask(id);
    taskService.saveToStorage();
    refreshState();
  }, [taskService, refreshState]);

  const removeTask = useCallback((id) => {
    taskService.removeTask(id);
    taskService.saveToStorage();
    refreshState();
  }, [taskService, refreshState]);

  const editTask = useCallback((id, newTitle) => {
    const result = taskService.editTask(id, newTitle);
    if (result.ok) {
      taskService.saveToStorage();
      refreshState();
    }
    return result;
  }, [taskService, refreshState]);

  const clearAllTasks = useCallback(() => {
    taskService.clearAllTasks();
    taskService.saveToStorage();
    refreshState();
  }, [taskService, refreshState]);

  const filteredTasks = useMemo(() => {
    return taskService.filterTasks(state.tasks, filter, search);
  }, [taskService, state.tasks, filter, search]);

  return {
    state: { ...state, tasks: filteredTasks },
    filter,
    search,
    setFilter,
    setSearch,
    addTask,
    toggleTask,
    removeTask,
    editTask,
    clearAllTasks,
  };
}
```

### App.jsx

```jsx
import { useState } from 'react';
import { useTaskService } from './hooks/useTaskService';
import TaskHeader from './components/TaskHeader';
import TaskForm from './components/TaskForm';
import TaskToolbar from './components/TaskToolbar';
import TaskList from './components/TaskList';
import Toast from './components/Toast';

export default function App() {
  const {
    state,
    filter,
    search,
    setFilter,
    setSearch,
    addTask,
    toggleTask,
    removeTask,
    editTask,
    clearAllTasks,
  } = useTaskService();

  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  };

  const handleAdd = (title) => {
    const result = addTask(title);
    if (result.ok) {
      showToast('Tarefa adicionada com sucesso!', 'success');
    } else {
      showToast('Erro ao adicionar tarefa', 'error');
    }
  };

  const handleToggle = (id) => {
    toggleTask(id);
  };

  const handleRemove = (id) => {
    if (confirm('Tem certeza que deseja remover a tarefa?')) {
      removeTask(id);
      showToast('Tarefa removida com sucesso!', 'success');
    }
  };

  const handleEdit = (id, title) => {
    setEditingTask({ id, title });
  };

  const handleSaveEdit = (id, title) => {
    const result = editTask(id, title);
    if (result.ok) {
      setEditingTask(null);
      showToast('Tarefa editada com sucesso!', 'success');
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja limpar todas as tarefas?')) {
      clearAllTasks();
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <TaskHeader stats={state.stats} />
      
      <TaskForm
        editingTask={editingTask}
        onAdd={handleAdd}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />
      
      <button
        onClick={handleClearAll}
        disabled={state.stats.total === 0}
        className="bg-red-500 text-white px-4 py-2 rounded-xl mb-4 disabled:opacity-50"
      >
        Limpar tudo
      </button>
      
      <TaskToolbar
        filter={filter}
        search={search}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />
      
      <TaskList
        tasks={state.tasks}
        filter={filter}
        onToggle={handleToggle}
        onRemove={handleRemove}
        onEdit={handleEdit}
      />
    </div>
  );
}
```

## Vantagens desta arquitetura

1. **Reutilização total**: `TaskApplicationService`, use-cases, entidades e repositórios são 100% reutilizados
2. **Testes**: Os testes da camada de domínio continuam funcionando sem alteração
3. **Flexibilidade**: Pode trocar de framework a qualquer momento
4. **Separação clara**: Lógica de negócio isolada da UI
