import type Livro from "../modelo/Livro";
import ControleEditora from "./ControleEditora";
import { criarLivrosIniciais } from "../dados/livrosIniciais";

export interface ArmazenamentoDemo {
    getItem(chave: string): string | null;
    setItem(chave: string, valor: string): void;
    removeItem(chave: string): void;
}

export const CHAVE_CATALOGO_DEMO = "estacio:catalogo-livros:demo:v1";

export class ErroCatalogoDemo extends Error {
    constructor(mensagem: string) {
        super(mensagem);
        this.name = "ErroCatalogoDemo";
    }
}

function normalizarDados(valor: unknown): Omit<Livro, "codigo"> {
    if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
        throw new ErroCatalogoDemo("Informe os dados do livro.");
    }
    const dados = valor as Record<string, unknown>;
    if (typeof dados.titulo !== "string" || !dados.titulo.trim()
        || typeof dados.resumo !== "string" || !dados.resumo.trim()
        || !Number.isInteger(dados.codEditora)
        || !new ControleEditora().getEditoras().some(editora => editora.codEditora === dados.codEditora)
        || !Array.isArray(dados.autores) || dados.autores.length === 0
        || !dados.autores.every((autor: unknown) => typeof autor === "string" && autor.trim())) {
        throw new ErroCatalogoDemo("Informe título, resumo, editora válida e autores.");
    }
    return {
        codEditora: dados.codEditora as number,
        titulo: dados.titulo.trim(),
        resumo: dados.resumo.trim(),
        autores: (dados.autores as string[]).map(autor => autor.trim())
    };
}

function gravarCatalogo(armazenamento: ArmazenamentoDemo, livros: Livro[]): void {
    try {
        armazenamento.setItem(CHAVE_CATALOGO_DEMO, JSON.stringify({ versao: 1, livros }));
    } catch {
        throw new ErroCatalogoDemo("Não foi possível salvar nesta aba. Verifique o espaço e a permissão de armazenamento do navegador.");
    }
}

export function carregarCatalogoDemo(armazenamento: ArmazenamentoDemo): Livro[] {
    let conteudo: string | null;
    try {
        conteudo = armazenamento.getItem(CHAVE_CATALOGO_DEMO);
    } catch {
        throw new ErroCatalogoDemo("Não foi possível ler os dados desta aba. Verifique a permissão de armazenamento do navegador.");
    }
    if (conteudo === null) return criarLivrosIniciais();

    try {
        const dados: unknown = JSON.parse(conteudo);
        if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw new Error();
        const catalogo = dados as Record<string, unknown>;
        if (catalogo.versao !== 1 || !Array.isArray(catalogo.livros)) throw new Error();
        const codigos = new Set<number>();
        return catalogo.livros.map((valor: unknown) => {
            if (!valor || typeof valor !== "object" || Array.isArray(valor)) throw new Error();
            const codigo = (valor as Record<string, unknown>).codigo;
            if (!Number.isSafeInteger(codigo) || (codigo as number) <= 0 || codigos.has(codigo as number)) throw new Error();
            codigos.add(codigo as number);
            return { codigo: codigo as number, ...normalizarDados(valor) };
        });
    } catch {
        throw new ErroCatalogoDemo("Os dados desta aba estão inválidos. Use Reiniciar demonstração para restaurar o catálogo fictício.");
    }
}

export function incluirLivroDemo(armazenamento: ArmazenamentoDemo, valor: unknown): Livro[] {
    const dados = normalizarDados(valor);
    const livros = carregarCatalogoDemo(armazenamento);
    const maiorCodigo = livros.reduce((maior, livro) => Math.max(maior, livro.codigo), 0);
    if (maiorCodigo === Number.MAX_SAFE_INTEGER) {
        throw new ErroCatalogoDemo("O limite de códigos desta demonstração foi atingido. Reinicie o catálogo para continuar.");
    }
    const atualizados = [...livros, { codigo: maiorCodigo + 1, ...dados }];
    gravarCatalogo(armazenamento, atualizados);
    return atualizados;
}

export function excluirLivroDemo(armazenamento: ArmazenamentoDemo, codigo: number): Livro[] {
    if (!Number.isSafeInteger(codigo) || codigo <= 0) {
        throw new ErroCatalogoDemo("Informe um código de livro válido.");
    }
    const livros = carregarCatalogoDemo(armazenamento);
    if (!livros.some(livro => livro.codigo === codigo)) {
        throw new ErroCatalogoDemo("Livro não encontrado nesta aba.");
    }
    const atualizados = livros.filter(livro => livro.codigo !== codigo);
    gravarCatalogo(armazenamento, atualizados);
    return atualizados;
}

export function reiniciarCatalogoDemo(armazenamento: ArmazenamentoDemo): Livro[] {
    try {
        armazenamento.removeItem(CHAVE_CATALOGO_DEMO);
    } catch {
        throw new ErroCatalogoDemo("Não foi possível reiniciar os dados desta aba. Verifique a permissão de armazenamento do navegador.");
    }
    return criarLivrosIniciais();
}
