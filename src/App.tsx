import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Layout } from "./components/layout"
import { TodayPage } from "./pages/today"
import { HistoricalPage } from "./pages/historical"

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TodayPage />} />
          <Route path="/historical" element={<HistoricalPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
