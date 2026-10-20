import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getTask, updateTask } from '../api'
import LoadingFallback from '../components/LoadingFallback'
import './TaskManagement.css'

function toDateInputValue(deadline) {
  if (!deadline) return ''

  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let isCurrent = true

    getTask(id)
      .then((task) => {
        if (!isCurrent) return
        setForm({
          title: task.title || '',
          description: task.description || '',
          deadline: toDateInputValue(task.deadline),
          priority: task.priority || 'medium',
          completed: Boolean(task.completed),
        })
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
  }, [id])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form) return

    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateTask(id, {
        ...form,
        deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : null,
      })
      setMessage('Task updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="task-form-page">
      <Link className="task-back-link" to="/tasks">← Back to tasks</Link>
      <header className="task-form-heading">
        <p className="task-eyebrow">Task details</p>
        <h1>Edit task</h1>
        <p>Update the details, priority, deadline, or completion status.</p>
      </header>

      {message && <div className="task-notice task-notice-success" role="status">{message}</div>}
      {error && <div className="task-notice task-notice-error" role="alert">{error}</div>}
      {loading ? (
        <div className="task-loading"><LoadingFallback label="Loading task..." /></div>
      ) : form ? (
        <form className="task-form" onSubmit={handleSubmit}>
          <label>
            Title <span aria-hidden="true">*</span>
            <input name="title" value={form.title} onChange={updateField} maxLength={160} required autoFocus />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={updateField} rows={5} maxLength={2000} />
          </label>
          <div className="task-form-row">
            <label>
              Deadline
              <input name="deadline" type="date" value={form.deadline} onChange={updateField} />
            </label>
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={updateField}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>
          <label className="task-checkbox-label">
            <input name="completed" type="checkbox" checked={form.completed} onChange={updateField} />
            Mark this task as completed
          </label>
          <div className="task-form-actions">
            <button className="task-secondary-button" type="button" onClick={() => navigate('/tasks')}>Cancel</button>
            <button className="task-primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      ) : null}
    </main>
  )
}

export default TaskDetails
