# Catálogo Next.js — demonstração acadêmica

Projeto de Lucas Alves no curso de Desenvolvimento Full Stack da Estácio, Mundo 2, Nível 3. React, Next.js 15.5.29 e TypeScript, com listagem, cadastro e exclusão de livros.

## Executar a API acadêmica local

Use Node.js 24 e npm:

```sh
cd livros-next
npm ci
npm run dev
```

Abra o endereço informado no terminal. As páginas consultam `/api/livros` na mesma origem. Esse modo usa dados fictícios em memória no servidor, sem persistência durável ou autenticação. Reiniciar o processo restaura o catálogo; não há garantia de estado compartilhado entre processos.

## Demonstração para a Vercel

```sh
npm run build:demo
npm start
```

O build de demonstração ativa `NEXT_PUBLIC_DEMO_MODE=true`. Cada aba mantém sua própria cópia fictícia em `sessionStorage`; cadastro e exclusão da interface escrevem nessa cópia, sem banco ou sincronização entre dispositivos. O catálogo oferece **Reiniciar demonstração**. Falhas de armazenamento são informadas e dados inválidos exigem reset explícito.

Nesse modo, a API serve o catálogo inicial e recusa POST/DELETE, evitando alterações compartilhadas em memória entre visitantes. A escrita da demonstração hospedada é no navegador; não representa persistência Full Stack. O modo API original permanece disponível no build padrão.

A Vercel deve usar **Root Directory: livros-next**. O `vercel.json` registra `npm ci` e `npm run build:demo`. Consulte o [guia de publicação](../docs/VERCEL.md). Nenhuma chave ou serviço de banco é necessário para essa demonstração. Use apenas exemplos fictícios.

## Verificar

```sh
npm test
npm run build
npm run test:http
npm run build:demo
npm run test:demo:http
```

- `npm test`: 38 casos isolados dos handlers/controles reais e do adaptador de armazenamento, com requisição/resposta e armazenamento simulados.
- `npm run test:http`: após o build padrão, inicia Next em `127.0.0.1:3187`, cadastra/lista/exclui um livro fictício e encerra o servidor.
- `npm run test:demo:http`: após o build demo, confere seed e recusa de mutações pelo servidor real. Exige o header do modo demo antes das tentativas.
- O [workflow](../.github/workflows/catalogo-next.yml) verifica os dois builds. Os scripts HTTP exigem a porta 3187 livre e utilizam somente loopback.

Os 38 casos isolados passaram localmente. O download de dependências é bloqueado na rede local; builds e verificações HTTP são executados no runner do GitHub. Consulte o resultado referente ao commit desejado na aba Actions.

A API padrão valida campos e editora no POST; a interface informa falhas e preserva os campos. Não foram criados banco, autenticação ou autorização para uso real. Build e testes automatizados não substituem a conferência visual do domínio publicado.

## Manutenção

A versão original em Next.js 14.2.3 foi atualizada para 15.5.29, com lockfile resolvido pelo npm e conferido contra o manifesto. A linha 15 está em Maintenance LTS na revisão de 06/11/2026; confira a [política de suporte](https://nextjs.org/support-policy) antes de novas publicações.
