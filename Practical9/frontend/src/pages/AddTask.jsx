import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createTask } from '../api'
import './TaskManagement.css'

function AddTask() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await createTask({
        ...form,
        deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : undefined,
        completed: false,
      })
      navigate('/tasks', { state: { message: 'Task created successfully.' } })
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
        <p className="task-eyebrow">Task management</p>
        <h1>Add a task</h1>
        <p>Give your next piece of work a clear title, priority, and due date.</p>
      </header>

      {error && <div className="task-notice task-notice-error" role="alert">{error}</div>}

      <form className="task-form" onSubmit={handleSubmit}>
        <label>
          Title <span aria-hidden="true">*</span>
          <input
            name="title"
            value={form.title}
            onChange={updateField}
            maxLength={160}
            required
            autoFocus
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            rows={5}
            maxLength={2000}
          />
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
        <div className="task-form-actions">
          <Link className="task-secondary-button" to="/tasks">Cancel</Link>
          <button className="task-primary-button" type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create task'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default AddTask
