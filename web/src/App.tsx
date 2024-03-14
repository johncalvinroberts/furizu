import { css } from '../styled-system/css';
import { Button } from './components/button';
import { API_URL } from './config';

function App() {
  return (
    <>
      <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
      <p>API_URL: {API_URL}</p>
      <Button>yolo</Button>
    </>
  );
}

export default App;
