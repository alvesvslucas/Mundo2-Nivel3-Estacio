import 'bootstrap/dist/css/bootstrap.css';
import { Menu } from "@/componentes/Menu";
import Link from "next/link";
import styles from "@/styles/style.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      <Menu />
      <main className={styles.main}>
        <h1 className={styles.title}>
          Catálogo de livros
        </h1>
        <p className={styles.intro}>Uma aplicação acadêmica de Lucas Alves para explorar livros, editoras e formulários com React, Next.js e TypeScript.</p>
        <div className={styles.actions}>
          <Link className="btn btn-primary btn-lg" href="/LivroLista">Explorar catálogo</Link>
          <Link className="btn btn-outline-secondary btn-lg" href="/LivroDados">Cadastrar livro</Link>
        </div>
        {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <p className={styles.note}>Demonstração com dados fictícios. As alterações ficam somente nesta aba e podem ser reiniciadas no catálogo.</p>}
      </main>
    </div>
  )
}
