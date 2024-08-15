import Editora from "../modelo/Editora";

//Dados JSON para as editoras.
const editoras: Array <Editora> = [
    {codEditora: 123, nome: "Editora Janeiro"},
    {codEditora: 456, nome: "Editora Fevereiro"},
    {codEditora: 789, nome: "Editora Março"}
];
//Classe com métodos para retornar o nome da editora pelo código e outro para retornar o vetor das editoras.
class ControleEditora {
    getNomeEditora(codEditora: number): string {
        const editora = editoras.filter(editora => editora.codEditora === codEditora)[0];
        return editora.nome;
    }
    getEditoras() {
        return editoras;
    }
}
export default ControleEditora;