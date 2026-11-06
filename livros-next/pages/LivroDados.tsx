import type { NextPage } from "next";
import React, { useState } from "react";
import styles from '../styles/Home.module.css'
import ControleEditora from "@/classes/controle/ControleEditora";
import Livro from "@/classes/modelo/Livro";
import { useRouter } from "next/router";
import { Menu } from "@/componentes/Menu";
import Head from "next/head";
import 'bootstrap/dist/css/bootstrap.css';

const controleEditora = new ControleEditora();

const baseURL = "/api/livros";

const incluirLivro = async (livro: Livro) => {
    const response = await fetch(baseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify(livro)
    });
    if (!response.ok) throw new Error('Falha ao salvar livro');
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
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const router = useRouter();

    const tratarCombo = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCodEditora(Number(event.target.value));
    }
    const incluir = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (salvando) return;
        setSalvando(true);
        setErro("");
        const livro: Livro = {
            codigo: 0,
            titulo: titulo,
            resumo: resumo,
            autores: autores.split("\n").map(autor => autor.trim()).filter(Boolean),
            codEditora: codEditora
        }
        try {
            await incluirLivro(livro);
            await router.push('/LivroLista');
        } catch {
            setErro('Não foi possível salvar. Confira os campos e tente novamente.');
        } finally {
            setSalvando(false);
        }
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
                        <input id="titulo" required className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="resumo" className="form-label">Resumo</label>
                        <textarea id="resumo" required className="form-control" value={resumo} onChange={(e) => setResumo(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editora" className="form-label">Editora</label>
                        <select id="editora" className="form-select" value={codEditora} onChange={tratarCombo}>
                            {opcoes.map(opcao => (
                                <option key={opcao.value} value={opcao.value}>{opcao.text}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="autores" className="form-label">Autores (1por linha)</label>
                        <textarea id="autores" required className="form-control" value={autores} onChange={(e) => setAutores(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <button type="submit" className="btn btn-primary" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar dados'}</button>
                    </div>
                    {erro && <p role="alert">{erro}</p>}
                </form>
            </main>
        </div>
    )
}

export default LivroDados;
