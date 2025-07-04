
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/home/Index';
import Payment from './pages/payment/Payment';
import Success from './pages/payment/Success';
import Cancel from './pages/payment/Cancel';
import Lobby from './pages/home/Lobby';
import GachaPage from './pages/gacha/Gacha';
import MatchingResult from './components/PVP/MathingResult';
import './App.css'; // Import your CSS file
import FloatingNav from './components/FloatinNav';
import BattleReplay from './components/PVP/BattleReplay';
import Stats from './pages/Stats';
function App() {
  return (
    <div className="font-prompt">
      <BrowserRouter >
        <FloatingNav />
        <Routes>

          <Route path="/" element={<Index />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/gacha" element={<GachaPage />} />
          <Route path="/matching-result" element={<MatchingResult />} />
          <Route path="/battle-replay/:battleId" element={<BattleReplay />} />
          <Route path="/stats" element={<Stats />} />
          
          {/* Catch-all route for 404 */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
