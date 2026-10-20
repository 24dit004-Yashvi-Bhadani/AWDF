import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createTask, generateDescription } from '../api'
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
  const [generating, setGenerating] = useState(false)
  const [aiNotice, setAiNotice] = useState(null)
  const [showAiDisclaimer, setShowAiDisclaimer] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const cooldowns = useRef(new Map())
  const navigate = useNavigate()

  useEffect(() => {
    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
      setCooldownRemaining(remaining)
    }

    updateRemaining()
    if (!cooldownUntil) return undefined

    const interval = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(interval)
  }, [cooldownUntil])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))

    if (name === 'title') {
      setAiNotice(null)
      const titleKey = value.trim().toLowerCase()
      const savedCooldown = cooldowns.current.get(titleKey) || 0
      const activeCooldown = savedCooldown > Date.now() ? savedCooldown : 0
      if (!activeCooldown) cooldowns.current.delete(titleKey)
      setCooldownUntil(activeCooldown)
    }
  }

  const handleGenerateDescription = async () => {
    const title = form.title.trim()
    if (!title || generating) return

    const titleKey = title.toLowerCase()
    const savedCooldown = cooldowns.current.get(titleKey) || 0
    if (savedCooldown > Date.now()) {
      setCooldownUntil(savedCooldown)
      return
    }

    const nextCooldown = Date.now() + 60_000
    cooldowns.current.set(titleKey, nextCooldown)
    setCooldownUntil(nextCooldown)
    setAiNotice(null)
    setShowAiDisclaimer(false)
    setGenerating(true)

    try {
      const result = await generateDescription(title)
      if (result.fallback) {
        setAiNotice({
          message: result.message || 'AI is temporarily unavailable. Please enter the description manually.',
          type: 'warning',
        })
        return
      }

      setForm((current) => ({ ...current, description: result.description || '' }))
      setShowAiDisclaimer(true)
    } catch (err) {
      setAiNotice({
        message: err.message || 'Unable to generate a description. Please try again or enter it manually.',
        type: 'error',
      })
    } finally {
      setGenerating(false)
    }
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
        <div className="task-ai-description-controls">
          <button
            className="task-secondary-button task-generate-button"
            type="button"
            onClick={handleGenerateDescription}
            disabled={!form.title.trim() || generating || cooldownRemaining > 0}
          >
            {generating ? (
              <>
                <span className="task-ai-spinner" aria-hidden="true" />
                Generating...
              </>
            ) : cooldownRemaining > 0 ? (
              `Generate again in ${cooldownRemaining}s`
            ) : (
              'Generate Description'
            )}
          </button>
          {aiNotice && (
            <p className={`task-ai-notice task-ai-notice-${aiNotice.type}`} role="status">
              {aiNotice.message}
            </p>
          )}
          {showAiDisclaimer && (
            <p className="task-ai-disclaimer">
              AI-generated suggestion. It may be inaccurate. Please review and edit before saving.
            </p>
          )}
        </div>
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
