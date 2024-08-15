import ControleEditora from "@/classes/controle/ControleEditora";
import Livro from "@/classes/modelo/Livro";
import React from "react";

const controleEditora = new ControleEditora();
interface LinhaLivroProps {
    livro: Livro;
    excluir: () => void
}
export const LinhaLivro: React.FC<LinhaLivroProps> = (props) => {
    const {livro, excluir} = props;
    const nomeEditora = controleEditora.getNomeEditora(livro.codEditora);
    return (
        <tr>
            <td>
                <div className="d-flex flex-column">
                    <span>{livro.titulo}</span>
                    <button type="button" className="btn btn-danger col-md-6" onClick={excluir}>Excluir</button>
                </div>
            </td>
            <td>{livro.resumo}</td>
            <td>{nomeEditora}</td>
            <td>{livro.autores.map((autor, index) => (<li key = {index}>{autor}</li>))}</td>
        </tr>
    )
}
