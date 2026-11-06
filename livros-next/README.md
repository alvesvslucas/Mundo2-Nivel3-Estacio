# Catálogo Next.js — demonstração acadêmica

Implementação em Next.js/React e TypeScript, com API interna para listar, incluir e excluir livros. Originada da missão acadêmica Mundo 2, Nível 3, da Estácio. Os dados de exemplo ficam em memória; não há banco externo.

## Executar

Use Node.js 24 com npm para repetir também os testes desta revisão.

```sh
cd livros-next
npm ci
npm run dev
```

Abra o endereço informado no terminal. O menu permite consultar o catálogo e cadastrar um livro. As páginas usam `/api/livros` na mesma origem, sem fixar o domínio ou a porta.

## Verificar

```sh
npm test
npm run build
npm run test:http
```

- `npm test`: 12 casos dos handlers e controles reais. O teste remove as anotações TypeScript pelo Node e simula requisição/resposta; não executa o framework nem o navegador.
- `npm run build`: compilação e verificação de tipos pelo Next.js.
- `npm run test:http`: inicia o build em `127.0.0.1:3187`, testa a API HTTP real com um registro fictício e encerra o servidor. Execute somente após o build, com a porta livre.
- O workflow [Catálogo Next.js](../.github/workflows/catalogo-next.yml) repete essas etapas em push e pull request para os arquivos deste componente.

No ambiente local desta revisão, passaram os 12 testes isolados e a conferência de sintaxe dos scripts. O download de dependências foi bloqueado pela rede; build e teste HTTP local não foram executados. Consulte o resultado do workflow no GitHub para a validação no runner.

## Comportamento e limites

O POST valida título, resumo, editora e autores no servidor; o código do livro é gerado pelo controle. Requisições inválidas retornam 400; exclusão de livro ausente retorna 404; métodos não suportados retornam 405. A interface informa falhas de rede/API e mantém os campos para nova tentativa.

Esta é uma demonstração acadêmica. Não há autenticação, autorização ou persistência durável. Alterações são compartilhadas no processo e se perdem ao reiniciar. Não há garantia de consistência entre processos, réplicas ou funções serverless; o smoke HTTP verifica apenas um servidor local. Não use dados reais de clientes.

O framework e as dependências do lockfile foram preservados nesta alteração. A atualização de dependências e a homologação do ambiente de hospedagem ainda são necessárias antes de oferecer uma demonstração pública.
