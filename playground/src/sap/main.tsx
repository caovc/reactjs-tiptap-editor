import ReactDOM from 'react-dom/client';
import { themeActions } from 'reactjs-tiptap-editor/theme';

import 'reactjs-tiptap-editor/style.css';
import './sap.css';

import SapApp from './SapApp';

themeActions.setTheme('light');
themeActions.setColor('blue');
const root = document.getElementById('root');
if (!root) throw new Error('SAP application root missing');
ReactDOM.createRoot(root).render(<SapApp />);
