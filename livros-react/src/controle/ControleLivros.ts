import Livro from "../modelo/Livro";

//Dados JSON para o livros.
const livros: Array <Livro> = [
    {codigo: 1478, codEditora: 789, titulo: "JavaScript", 
    resumo: "Conheça a história da linguagem e sua sintaxe com exemplos.", autores: ["Will", "Pedro"]},
    {codigo: 2556, codEditora:456, titulo: "CSS", 
    resumo: "Exercícios práticos para se tornar um expert na formatação de sites.", autores: ["Wilson", "Aráujo"]},
    {codigo: 9323, codEditora: 123, titulo: "HTML", 
    resumo: "Explore sua evolução e conheça todas as tags disponíveis.", autores: ["Pedro", "Avilar"]}
];
//Classe com métodos para retornar o vetor de livros, incluir ou excluir.
class ControleLivro {
    obterLivros () {
        return livros;
    }
    incluir (novoLivro: Livro): void {
        const maiorCodigo = livros.reduce((maior, livro) => (livro.codigo > maior ? livro.codigo : maior), 0);
        novoLivro.codigo = maiorCodigo + 1;
        livros.push (novoLivro);
    }
    excluir (codigo: number): void {
        const indice = livros.findIndex (livro => livro.codigo === codigo);
        if (indice !== -1) {
            livros.splice(indice, 1);
        }
    }
}
export default ControleLivro;