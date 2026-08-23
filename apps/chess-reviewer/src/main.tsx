import React from 'react';
import { createRoot } from 'react-dom/client';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import './styles/app.css';
import { App } from './ui/App';
import { applyPrefs } from './lib/theme';

applyPrefs(); // board/pieces/background before first paint — no flash of defaults

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
