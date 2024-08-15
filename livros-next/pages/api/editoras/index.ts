import ControleEditora from "@/classes/controle/ControleEditora";
import { NextApiRequest, NextApiResponse } from 'next';

export const controleEditora = new ControleEditora();

export default (req: NextApiRequest, res:NextApiResponse) => {
    try {
        if (req.method === 'GET') {
            const editoras = controleEditora.getEditoras();
            res.status(200).json(editoras);
        } else {
            res.status(405).json({message: 'Método não permitido.'});
        }
    } catch (error) {
        res.status(500).json({mensagem: 'Exceção ocorrida no servidor.'});
    }
};
