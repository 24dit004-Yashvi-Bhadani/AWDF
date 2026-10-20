import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { deleteTask, getTasks, updateTask } from '../api'
import LoadingFallback from '../components/LoadingFallback'
import './TaskManagement.css'

const TaskStatusChart = lazy(() => import('./TaskStatusChart'))

const columns = [
  { priority: 'high', label: 'High priority', color: 'red' },
  { priority: 'medium', label: 'Medium priority', color: 'blue' },
  { priority: 'low', label: 'Low priority', color: 'green' },
]

const priorities = ['high', 'medium', 'low']
const getPriority = (task) => priorities.includes(task.priority) ? task.priority : 'medium'
const getTaskTitle = (task) => task.title?.trim() || 'Untitled task'

function taskCollisionDetection(args) {
  const pointerCollisions = pointerWithin(args)
  const rectangleCollisions = rectIntersection(args)
  const deleteZone = [...pointerCollisions, ...rectangleCollisions]
    .find((collision) => collision.id === 'delete-zone')

  return deleteZone ? [deleteZone] : closestCorners(args)
}

function formatDeadline(deadline) {
  if (!deadline) return 'No deadline'

  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) return 'Invalid deadline'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(date)
}

function isUpcoming(deadline) {
  if (!deadline) return false

  const date = new Date(deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return !Number.isNaN(date.getTime()) && date >= today
}

function SortableTaskCard({ task, onDelete, onToggleComplete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id })
  const priority = getPriority(task)
  const dueSoon = priority === 'high' && isUpcoming(task.deadline)
  const transformStyle = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
    : undefined

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: transformStyle,
        transition,
      }}
      className={`task-card priority-${priority}${dueSoon ? ' task-card-due-soon' : ''}${isDragging ? ' task-card-dragging' : ''}`}
    >
      <div className="task-card-heading">
        <Link className={`task-card-title${task.completed ? ' task-title-completed' : ''}`} to={`/tasks/${task._id}`}>
          {getTaskTitle(task)}
        </Link>
        <button
          type="button"
          className="task-drag-handle"
          aria-label={`Drag ${getTaskTitle(task)}`}
          title="Drag to move or delete"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      </div>

      <p className="task-card-description">
        {task.description?.trim() || 'No description provided.'}
      </p>

      <div className="task-card-meta">
        <span className="task-priority-label">{priority} priority</span>
        <span className="task-deadline">
          <span aria-hidden="true">◷</span> {formatDeadline(task.deadline)}
        </span>
      </div>

      <div className="task-card-footer">
        <span className={`task-status ${task.completed ? 'status-completed' : 'status-pending'}`}>
          {task.completed ? 'Completed' : 'Pending'}
        </span>
        <div className="task-card-actions">
          <button type="button" className="task-link-button" onClick={() => onToggleComplete(task)}>
            {task.completed ? 'Reopen' : 'Complete'}
          </button>
          <Link className="task-link-button" to={`/tasks/${task._id}`}>Edit</Link>
          <button type="button" className="task-delete-button" onClick={() => onDelete(task._id)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

function PriorityColumn({ column, tasks, highlighted, onDelete, onToggleComplete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `priority-${column.priority}`,
    data: { priority: column.priority },
  })
  const taskIds = tasks.map((task) => task._id)

  return (
    <section
      ref={setNodeRef}
      className={`kanban-column column-${column.color}${isOver || highlighted ? ' column-drop-target' : ''}`}
      aria-label={`${column.label}, ${tasks.length} tasks`}
    >
      <header className="kanban-column-header">
        <div>
          <span className="column-indicator" aria-hidden="true" />
          <h2>{column.label}</h2>
        </div>
        <span className="task-count">{tasks.length}</span>
      </header>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="kanban-column-content">
          {tasks.length === 0 ? (
            <p className="empty-column">Drop a task here</p>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task._id}
                task={task}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  )
}

function DeleteDropZone({ active }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'delete-zone' })

  return (
    <div
      ref={setNodeRef}
      className={`task-delete-zone${active ? ' delete-zone-ready' : ''}${isOver ? ' delete-zone-over' : ''}`}
    >
      <span className="delete-zone-icon" aria-hidden="true">⌫</span>
      <div>
        <strong>Drop here to delete</strong>
        <p>Dragging a task here will permanently remove it.</p>
      </div>
    </div>
  )
}

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [activeDropPriority, setActiveDropPriority] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    let isCurrent = true

    getTasks()
      .then((data) => {
        if (isCurrent) setTasks(data)
      })
      .catch((err) => {
        if (isCurrent) setError(err.message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const visibleTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.title?.toLowerCase().includes(normalizedSearch) ||
        task.description?.toLowerCase().includes(normalizedSearch)
      const matchesFilter =
        filter === 'all' ||
        filter === getPriority(task) ||
        (filter === 'completed' && task.completed) ||
        (filter === 'pending' && !task.completed)

      return matchesSearch && matchesFilter
    })
  }, [filter, search, tasks])

  const updateCompletion = async (task) => {
    setError('')
    setMessage('')
    try {
      const updatedTask = await updateTask(task._id, { completed: !task.completed })
      setTasks((current) => current.map((item) => item._id === task._id ? updatedTask : item))
      setMessage(updatedTask.completed ? 'Task marked complete.' : 'Task moved back to pending.')
    } catch (err) {
      setError(err.message)
    }
  }

  const removeTask = async (id, confirm = true) => {
    if (confirm && !window.confirm('Delete this task permanently?')) return

    const previousTasks = tasks
    setError('')
    setMessage('')
    setTasks((current) => current.filter((task) => task._id !== id))

    try {
      await deleteTask(id)
      setMessage('Task deleted successfully.')
    } catch (err) {
      setTasks(previousTasks)
      setError(err.message)
    }
  }

  const getDropPriority = (over) => {
    if (!over) return ''
    if (over.data.current?.priority) return over.data.current.priority
    if (String(over.id).startsWith('priority-')) return String(over.id).slice('priority-'.length)
    return getPriority(tasks.find((task) => task._id === over.id) || {})
  }

  const handleDragStart = ({ active }) => {
    setActiveTaskId(String(active.id))
    setMessage('')
    setError('')
  }

  const handleDragOver = ({ over }) => {
    setActiveDropPriority(over?.id === 'delete-zone' ? '' : getDropPriority(over))
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveTaskId(null)
    setActiveDropPriority('')
    if (!over) return

    const taskId = String(active.id)
    if (over.id === 'delete-zone') {
      await removeTask(taskId, false)
      return
    }

    const task = tasks.find((item) => item._id === taskId)
    const destinationPriority = getDropPriority(over)
    if (!task || !destinationPriority || getPriority(task) === destinationPriority) return

    const previousTasks = tasks
    setTasks((current) => current.map((item) =>
      item._id === taskId ? { ...item, priority: destinationPriority } : item,
    ))

    try {
      const updatedTask = await updateTask(taskId, { priority: destinationPriority })
      setTasks((current) => current.map((item) => item._id === taskId ? updatedTask : item))
      setMessage(`Task moved to ${destinationPriority} priority.`)
    } catch (err) {
      setTasks(previousTasks)
      setError(err.message)
    }
  }

  const activeTask = tasks.find((task) => task._id === activeTaskId)

  return (
    <main className="task-page">
      <header className="task-page-header">
        <div>
          <p className="task-eyebrow">Your workspace</p>
          <h1>Tasks</h1>
          <p className="task-page-subtitle">Plan the work, keep priorities clear, and stay on top of deadlines.</p>
        </div>
        <Link className="task-primary-button" to="/tasks/add">+ Add task</Link>
      </header>

      {message && <div className="task-notice task-notice-success" role="status">{message}</div>}
      {error && <div className="task-notice task-notice-error" role="alert">{error}</div>}

      <section className="task-toolbar" aria-label="Search and filter tasks">
        <label className="task-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search by title or description"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search tasks"
          />
        </label>
        <label className="task-filter">
          <span>Show</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter tasks">
            <option value="all">All tasks</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </label>
      </section>

      {loading ? (
        <div className="task-loading"><LoadingFallback label="Loading tasks..." /></div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={taskCollisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragCancel={() => {
              setActiveTaskId(null)
              setActiveDropPriority('')
            }}
            onDragEnd={handleDragEnd}
          >
            <div className="kanban-board">
              {columns.map((column) => {
                const columnTasks = visibleTasks.filter((task) => getPriority(task) === column.priority)
                return (
                  <PriorityColumn
                    key={column.priority}
                    column={column}
                    tasks={columnTasks}
                    highlighted={activeDropPriority === column.priority}
                    onDelete={removeTask}
                    onToggleComplete={updateCompletion}
                  />
                )
              })}
            </div>
            <DeleteDropZone active={Boolean(activeTask)} />
            <DragOverlay>
              {activeTask && <div className="task-drag-preview">{getTaskTitle(activeTask)}</div>}
            </DragOverlay>
          </DndContext>
          {!loading && tasks.length === 0 && (
            <p className="task-empty-message">No tasks yet. Add your first task to get started.</p>
          )}
          {!loading && tasks.length > 0 && visibleTasks.length === 0 && (
            <p className="task-empty-message">No tasks match your search or filter.</p>
          )}
        </>
      )}

      {tasks.length > 0 && (
        <Suspense fallback={<LoadingFallback label="Loading task chart..." />}>
          <TaskStatusChart tasks={tasks} />
        </Suspense>
      )}
    </main>
  )
}

export default Tasks
