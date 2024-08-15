import Link from "next/link";
import 'bootstrap/dist/css/bootstrap.css';

export const Menu: React.FC = () => {
    return(
        <nav className='navbar navbar-expand navbar-dark bg-dark'>
            <div className='container-fluid d-flex flex-row'>
                <ul className='navbar-nav'>
                    <li className='nav-item'>
                        <Link href='/' legacyBehavior>
                            <a className="nav-link">Home</a>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link href='/LivroLista' legacyBehavior>
                            <a className="nav-link">Catálogo</a>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link href='/LivroDados' legacyBehavior>
                            <a className="nav-link">Novo</a>
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}