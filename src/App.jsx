import { useEffect } from 'react'
import Engine from './engine/index'

function App() {

  useEffect(() => {
    const engine = new Engine({
      container: document.getElementById('container'),
    })
  }, [])

  return (
    <div className="App" id="container">
    </div>
  )
}

export default App
