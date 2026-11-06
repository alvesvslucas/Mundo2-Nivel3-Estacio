# Catálogo de Livros com React e Next.js

Missão acadêmica do curso de Desenvolvimento Full Stack da Estácio — Mundo 2, Nível 3.

**Aluno:** Lucas Alves Vieira da Silva.

O repositório reúne duas implementações de listagem e cadastro de livros com HTML, TypeScript e componentes React. A versão Next.js também inclui uma API interna em `pages/api/livros/`.

## Tecnologias e pastas

| Pasta | Dependências declaradas | Scripts disponíveis |
| --- | --- | --- |
| `livros-react/` | React 18, React Router 6, TypeScript 4, React Scripts 5 | `start`, `build`, `test`, `eject` |
| `livros-next/` | Next.js 15.5.29, React 18, TypeScript 5 | `dev`, `build`, `build:demo`, `start`, `lint`, `test`, `test:http`, `test:demo:http` |

É necessário Node.js com npm. Os manifestos não definem uma versão de Node em `engines`; valide a compatibilidade com as dependências de cada pasta.

## Executar localmente

```sh
git clone https://github.com/alvesvslucas/Mundo2-Nivel3-Estacio.git
cd Mundo2-Nivel3-Estacio
```

Para a versão React, a partir da raiz:

```sh
cd livros-react
npm install
npm start
```

Para a versão Next.js, em outro terminal a partir da raiz:

```sh
cd livros-next
npm install
npm run dev
```

Acesse o endereço informado por cada servidor. Ao executar as duas versões, escolha portas diferentes se houver conflito.

## Build e verificações

Na pasta React, use `npm run build` e `npm test`; a execução dessa versão não foi realizada nesta revisão.

Na pasta Next.js, `npm test` executa 38 casos isolados dos handlers, controles e armazenamento de demonstração. Eles passaram localmente. O workflow instala pelo lockfile, compila e verifica HTTP contra um servidor Next real nos modos API e demonstração; o download de dependências é bloqueado na rede local.

Consulte [execução, verificações e limites da demonstração Next.js](livros-next/README.md). O modo API mantém dados em memória; o build para Vercel usa uma cópia fictícia por aba, sem banco. Consulte o [guia de publicação na Vercel](docs/VERCEL.md). Use apenas exemplos fictícios.

## Capturas

![Catálogo React](capturas_de_tela/Captura_de_tela_React_1.png)
![Cadastro React](capturas_de_tela/Captura_de_tela_React_2.png)
![Catálogo Next.js](capturas_de_tela/Captura_de_tela_Next_1.png)
![Cadastro Next.js](capturas_de_tela/Captura_de_tela_Next_2.png)
![Next.js](capturas_de_tela/Captura_de_tela_Next_3.png)

