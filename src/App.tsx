import { Route, Routes, Navigate } from 'react-router-dom';
import Lobby from '@pages/Lobby';
import Room from '@pages/Room';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Lobby />} />
      <Route path='/room/:roomId' element={<Room />} />
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  );
}

export default App;
