import type { NextPage } from "next";
import React, { useState } from "react";
import styles from '../styles/Home.module.css'
import ControleEditora from "@/classes/controle/ControleEditora";
import Livro from "@/classes/modelo/Livro";
import { Router, useRouter } from "next/router";
import { Menu } from "@/componentes/Menu";
import Head from "next/head";
import 'bootstrap/dist/css/bootstrap.css';

const controleEditora = new ControleEditora();

const baseURL = "http://localhost:3000/api/livros";

const incluirLivro = async (livro: Livro) => {
    const response = await fetch(baseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify(livro)
    });
    return response.ok
}

const LivroDados: NextPage = () => {
    const opcoes = controleEditora.getEditoras().map((editora => ({
        value: editora.codEditora,
        text: editora.nome
    })))
    const [titulo, setTitulo] = useState<string>("");
    const [resumo, setResumo] = useState<string>("");
    const [autores, setAutores] = useState<string>("");
    const [codEditora, setCodEditora] = useState(opcoes[0].value);
    const router = useRouter();

    const tratarCombo = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCodEditora(Number(event.target.value));
    }
    const incluir = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const livro: Livro = {
            codigo: 0,
            titulo: titulo,
            resumo: resumo,
            autores: autores.split("\n"),
            codEditora: codEditora
        }
        incluirLivro(livro).then(() => router.push('/LivroLista'))
    }
    return (
        <div className={styles.container}>
            <Head>
                <title>Loja Next</title>
            </Head>
            <Menu />
            <main className={styles.main}>
                <h1 className={styles.title}>
                    Dados do livro
                </h1>
                <form onSubmit={incluir}>
                    <div className="mb-3">
                        <label htmlFor="titulo" className="form-label">Título</label>
                        <input className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="resumo" className="form-label">Resumo</label>
                        <textarea className="form-control" value={resumo} onChange={(e) => setResumo(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editora" className="form-label">Editora</label>
                        <select className="form-select" value={codEditora} onChange={tratarCombo}>
                            {opcoes.map(opcao => (
                                <option key={opcao.value} value={opcao.value}>{opcao.text}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="autores" className="form-label">Autores (1por linha)</label>
                        <textarea className="form-control" value={autores} onChange={(e) => setAutores(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <button type="submit" className="btn btn-primary" >Salvar dados</button>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default LivroDados;