import ServersPage from './pages/ServersPage';
import OraclePage from './pages/OraclePage';
import { useEffect, useState } from 'react';

function App() {
     const [path, setPath] = useState(window.location.hash);
     useEffect(() => {
          const updatePath = () => setPath(window.location.hash);
          window.addEventListener('hashchange', updatePath);
          return () => window.removeEventListener('hashchange', updatePath);
     }, []);
     if (path === '#/oracle' || path.startsWith('#/oracle/')) {
          const view = path === '#/oracle' ? 'overview' : path.slice('#/oracle/'.length);
          return <OraclePage view={view} />;
     }
     return <ServersPage />;
}

export default App;
