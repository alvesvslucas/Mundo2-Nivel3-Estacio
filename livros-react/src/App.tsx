import LivroLista from './LivroLista';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LivroDados from './LivroDados';

function App() {
  return (
    <BrowserRouter>
      <nav className='navbar navbar-expand navbar-dark bg-dark'>
        <div className='container-fluid d-flex flex-row'>
          <ul className='navbar-nav'>
            <li className='nav-item'>
              <Link to={'/'} className='nav-link'>Catálogo</Link>
            </li>
            <li className='nav-item'>
              <Link to={'/dados'} className='nav-link'>Novo</Link>
            </li>
          </ul>
        </div>
      </nav>
      <Routes>
        <Route path='/' element = {<LivroLista/>}/>
        <Route path='/dados' element = {<LivroDados/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
