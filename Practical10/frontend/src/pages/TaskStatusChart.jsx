import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Legend, Tooltip)

function TaskStatusChart({ tasks }) {
  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.length - completedCount
  const data = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completedCount, pendingCount],
        backgroundColor: ['#16a34a', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  }

  return (
    <section className="task-chart" aria-label="Task status overview">
      <h2>Task status</h2>
      <div className="task-chart-canvas">
        <Doughnut
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom' } },
          }}
        />
      </div>
    </section>
  )
}

export default TaskStatusChart
