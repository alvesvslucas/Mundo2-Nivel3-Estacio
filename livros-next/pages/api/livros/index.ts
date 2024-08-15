import ControleLivro from "@/classes/controle/ControleLivros";
import { NextApiRequest, NextApiResponse } from "next";

export const controleLivro = new ControleLivro();

export default (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'GET') {
            const vetorLivros = controleLivro.obterLivros();
            res.status(200).json(vetorLivros);
        } else if (req.method === 'POST') {
            const novoLivro = req.body;
            controleLivro.incluir(novoLivro);
            res.status(200).json({mensagem: 'Sucesso.'})
        } else {
            res.status(405).json({mensagem: 'Método não permitido.'});
        }
    } catch (error) {
        res.status(500).json({mensagem: 'Exceção ocorrida no servidor.'})
    }
}