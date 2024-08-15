import { NextApiRequest, NextApiResponse } from 'next';
import {controleLivro} from '.';

export default (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'DELETE') {
        try {
            const codExcluir = Number(req.query.codigo);
            controleLivro.excluir(codExcluir);
            res.status(200).json({message: 'Sucesso.'})
        } catch (error) {
            res.status(500).json({message: 'Exceção ocorrida no servidor.'})
        }
    } else {
        res.status(405).json({message: 'Método não permitido.'})
    }
}