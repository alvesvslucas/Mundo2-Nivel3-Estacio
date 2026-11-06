import type { NextApiRequest, NextApiResponse } from 'next';
import {controleLivro} from '.';

export default (req: NextApiRequest, res: NextApiResponse) => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        res.setHeader('X-Demo-Mode', 'session-storage');
        res.setHeader('Allow', '');
        return res.status(405).json({message: 'Nesta demonstração, alterações são salvas apenas na aba do navegador.'});
    }
    if (req.method === 'DELETE') {
        try {
            const codExcluir = Number(req.query.codigo);
            if (Array.isArray(req.query.codigo) || !Number.isSafeInteger(codExcluir) || codExcluir <= 0) {
                return res.status(400).json({message: 'Código inválido.'});
            }
            if (!controleLivro.obterLivros().some(livro => livro.codigo === codExcluir)) {
                return res.status(404).json({message: 'Livro não encontrado.'});
            }
            controleLivro.excluir(codExcluir);
            res.status(200).json({message: 'Sucesso.'})
        } catch (error) {
            res.status(500).json({message: 'Exceção ocorrida no servidor.'})
        }
    } else {
        res.setHeader('Allow', 'DELETE');
        res.status(405).json({message: 'Método não permitido.'})
    }
}
