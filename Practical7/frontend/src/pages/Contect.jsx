import { useState } from 'react'
import '../pages/Contact.css'

function Contect() {
    const [message, setMessage] = useState('')

    return (
        <div className="contact-page">
            <h2>Contact Me</h2>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
            />
            <p>Live preview: {message}</p>
            <p>Character Count: {message.length}</p>
        </div>
    )
}

export default Contect