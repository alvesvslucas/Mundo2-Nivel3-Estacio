import 'bootstrap/dist/css/bootstrap.css';
import { Menu } from "@/componentes/Menu";
import Head from "next/head";
import styles from "@/styles/style.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Loja Next</title>
      </Head>
      <Menu />
      <main className={styles.main}>
        <h1 className={styles.title}>
          Página inicial
        </h1>
      </main>
    </div>
  )
}