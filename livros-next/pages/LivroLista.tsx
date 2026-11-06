import type { NextPage } from "next";
import 'bootstrap/dist/css/bootstrap.css';
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'
import type Livro from "@/classes/modelo/Livro";
import Head from "next/head";
import { Menu } from "@/componentes/Menu";
import { LinhaLivro } from "@/componentes/LinhaLivro";
import { carregarCatalogoDemo, excluirLivroDemo, reiniciarCatalogoDemo, ErroCatalogoDemo } from "@/classes/controle/CatalogoDemo";

const baseURL = "/api/livros";
const modoDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const LivroLista: NextPage = () => {
    const [livros, setLivros] = useState<Array<Livro>>([]);
    const [carregado, setCarregado] = useState<boolean>(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        if (!carregado) {
            let ativo = true;
            obterLivros().then(dados => {
                if (!ativo) return;
                setLivros(dados);
                setCarregado(true);
                setErro("");
            }).catch((error: unknown) => {
                if (ativo) setErro(error instanceof ErroCatalogoDemo ? error.message : modoDemo
                    ? 'Não foi possível acessar os dados desta aba. Verifique a permissão de armazenamento do navegador.'
                    : 'Não foi possível carregar o catálogo. Tente novamente.');
            });
            return () => { ativo = false; };
        }
    }, [carregado]);

    const excluir = async (codigo: number) => {
        try {
            await excluirLivro(codigo);
            setErro("");
            setCarregado(false);
        } catch (error: unknown) {
            setErro(error instanceof ErroCatalogoDemo ? error.message : modoDemo
                ? 'Não foi possível alterar os dados desta aba. Verifique a permissão de armazenamento do navegador.'
                : 'Não foi possível excluir o livro. O catálogo foi preservado.');
        }
    }

    const reiniciar = () => {
        try {
            setLivros(reiniciarCatalogoDemo(window.sessionStorage));
            setCarregado(true);
            setErro("");
        } catch (error: unknown) {
            setErro(error instanceof ErroCatalogoDemo ? error.message
                : 'Não foi possível reiniciar. Verifique a permissão de armazenamento do navegador.');
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
                    Catálogo de livros
                </h1>
                {modoDemo && <div className="alert alert-info" role="note">
                    <p className="mb-2">Demonstração acadêmica: dados fictícios salvos nesta aba do navegador. As alterações não são compartilhadas com outros visitantes nem gravadas em banco de dados.</p>
                    <button type="button" className="btn btn-outline-primary" onClick={reiniciar}>Reiniciar demonstração</button>
                </div>}
                <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th className="col-2 text-left p-2 bg-dark text-light">Título</th>
                            <th className="col-6 text-left p-2 bg-dark text-light">Resumo</th>
                            <th className="col-2 text-left p-2 bg-dark text-light">Editora</th>
                            <th className="col-2 text-left p-2 bg-dark text-light">Autores</th>
                        </tr>
                        </thead>
                    <tbody>
                        {livros.map(livro => (
                            <LinhaLivro key={livro.codigo} livro={livro} excluir={() => excluir(livro.codigo)} />
                        ))}
                    </tbody>
                </table>
                </div>
                {erro && <p role="alert">{erro}</p>}
            </main>
        </div>
    )
}
const obterLivros = async () => {
    if (modoDemo) return carregarCatalogoDemo(window.sessionStorage);
    const response = await fetch(baseURL);
    if (!response.ok) throw new Error('Falha ao carregar livros');
    const dados = await response.json();
    return (dados)
}
const excluirLivro = async (codigo: number) => {
    if (modoDemo) {
        excluirLivroDemo(window.sessionStorage, codigo);
        return true;
    }
    const response = await fetch (`${baseURL}/${codigo}`, {method: "DELETE"});
    if (!response.ok) throw new Error('Falha ao excluir livro');
    return response.ok
}

export default LivroLista;
