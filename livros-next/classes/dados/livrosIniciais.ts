import type Livro from "../modelo/Livro";

type LivroInicial = Readonly<Omit<Livro, "autores">> & {
    readonly autores: readonly string[];
};

export const LIVROS_INICIAIS: readonly LivroInicial[] = Object.freeze([
    Object.freeze({
        codigo: 1478, codEditora: 789, titulo: "JavaScript",
        resumo: "Conheça a história da linguagem e sua sintaxe com exemplos.",
        autores: Object.freeze(["Will", "Pedro"])
    }),
    Object.freeze({
        codigo: 2556, codEditora: 456, titulo: "CSS",
        resumo: "Exercícios práticos para se tornar um expert na formatação de sites.",
        autores: Object.freeze(["Wilson", "Aráujo"])
    }),
    Object.freeze({
        codigo: 9323, codEditora: 123, titulo: "HTML",
        resumo: "Explore sua evolução e conheça todas as tags disponíveis.",
        autores: Object.freeze(["Pedro", "Avilar"])
    })
]);

export const criarLivrosIniciais = (): Livro[] => {
    return LIVROS_INICIAIS.map(livro => ({ ...livro, autores: [...livro.autores] }));
};
