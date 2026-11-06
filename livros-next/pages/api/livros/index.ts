import ControleLivro from "@/classes/controle/ControleLivros";
import ControleEditora from "@/classes/controle/ControleEditora";
import type { NextApiRequest, NextApiResponse } from "next";

export const controleLivro = new ControleLivro();
const controleEditora = new ControleEditora();

export default (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'GET') {
            const vetorLivros = controleLivro.obterLivros();
            res.status(200).json(vetorLivros);
        } else if (req.method === 'POST') {
            const dados = req.body;
            if (!dados || typeof dados !== 'object' || Array.isArray(dados)
                || typeof dados.titulo !== 'string' || !dados.titulo.trim()
                || typeof dados.resumo !== 'string' || !dados.resumo.trim()
                || !Number.isInteger(dados.codEditora)
                || !controleEditora.getEditoras().some(editora => editora.codEditora === dados.codEditora)
                || !Array.isArray(dados.autores) || dados.autores.length === 0
                || !dados.autores.every((autor: unknown) => typeof autor === 'string' && autor.trim())) {
                return res.status(400).json({mensagem: 'Informe título, resumo, editora válida e autores.'});
            }
            const novoLivro = {
                codigo: 0,
                codEditora: dados.codEditora,
                titulo: dados.titulo.trim(),
                resumo: dados.resumo.trim(),
                autores: dados.autores.map((autor: string) => autor.trim())
            };
            controleLivro.incluir(novoLivro);
            res.status(200).json({mensagem: 'Sucesso.'})
        } else {
            res.setHeader('Allow', 'GET, POST');
            res.status(405).json({mensagem: 'Método não permitido.'});
        }
    } catch (error) {
        res.status(500).json({mensagem: 'Exceção ocorrida no servidor.'})
    }
}
