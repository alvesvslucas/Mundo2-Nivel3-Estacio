import type Livro from "../modelo/Livro";
import { criarLivrosIniciais } from "../dados/livrosIniciais";

//Dados JSON para o livros.
const livros: Array<Livro> = criarLivrosIniciais();
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
