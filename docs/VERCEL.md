# Publicação da demonstração na Vercel

O componente publicado é `livros-next/`. A versão React permanece independente.

## Configuração do projeto

Importe `alvesvslucas/Mundo2-Nivel3-Estacio` em [New Project](https://vercel.com/new) e configure:

| Campo | Valor |
| --- | --- |
| Project Name | `lucas-alves-catalogo` ou outro nome disponível na conta |
| Framework Preset | Next.js |
| Root Directory | `livros-next` |
| Node.js | 24.x |
| Install Command | `npm ci` |
| Build Command | `npm run build:demo` |
| Output Directory | Padrão do framework |

O `vercel.json` dentro do componente registra framework e comandos. A Root Directory deve ser selecionada na importação; a raiz do repositório contém dois projetos.

Não são necessários banco, chave privada ou variável de ambiente para o modo público: `build:demo` define `NEXT_PUBLIC_DEMO_MODE=true` durante a compilação. Não é um segredo. O build comum (`npm run build`) preserva a API acadêmica com estado em memória para execução local.

Login, aceite de termos e eventual concessão de acesso ao GitHub devem ser concluídos pelo titular. Se for necessário autorizar acesso a repositórios, limitar ao repositório público desta demonstração. Este guia não implica contratação de plano ou serviço pago.

## Dados da demonstração

Cada aba trabalha com sua própria cópia fictícia do catálogo em `sessionStorage`. Salvar e excluir na interface alteram essa cópia; não gravam em banco nem sincronizam entre dispositivos. Reiniciar demonstração restaura o catálogo inicial. Não inserir dados reais de clientes.

As APIs continuam disponíveis para consulta. O build de demonstração recusa as mutações POST/DELETE na API, evitando que visitantes compartilhem alterações no array de um processo da Vercel. A escrita da interface hospedada é local à aba; isso não representa persistência Full Stack.

O código da API original e seus testes permanecem no modo padrão, separadamente documentado. Para uma aplicação com gravação durável no servidor, será necessário um banco e um contrato de autenticação/autorização adequado ao uso; isso não foi criado nesta preparação.

## Conferir antes de divulgar

1. Aguardar o deployment terminar com sucesso e abrir o domínio efetivamente retornado pela Vercel.
2. Conferir página inicial, catálogo e cadastro no computador e no celular.
3. Criar um livro fictício, navegar entre páginas e recarregar; o registro deve permanecer na mesma aba.
4. Excluir o registro e usar Reiniciar demonstração; o catálogo inicial deve voltar.
5. Usar dois contextos independentes de navegador e conferir que alterações não vazam entre visitantes.
6. Verificar que POST/DELETE da API são recusados no deployment de demonstração.
7. Somente então adicionar a URL real ao README, ao perfil e à área About do GitHub.

## Versão do framework

A preparação atualiza Next.js e `eslint-config-next` de 14.2.3 para 15.5.29, mantendo React 18 e o Pages Router do catálogo. A linha 14 está fora de suporte. A linha 15 é uma transição em Maintenance LTS; novas atualizações devem ser conferidas antes de cada publicação. Não há garantia geral de segurança decorrente apenas da atualização.

O lockfile é resolvido pelo npm no runner e versionado no mesmo conjunto de mudanças. A CI deve concluir `npm ci`, testes, build e smoke HTTP do modo API, além de build e verificação HTTP do modo de demonstração. Testes de handlers e armazenamento usam dependências simuladas e não substituem a conferência visual do deployment.

## Estado da publicação

Preparação de código e configuração. Nenhum domínio de produção deve ser informado antes da confirmação do deployment na conta Vercel. A sessão do navegador consultada nesta etapa pediu login; não houve publicação por esse acesso.

## Referências oficiais

- [Política de suporte do Next.js](https://nextjs.org/support-policy)
- [Next.js 15 e compatibilidade com React 18 no Pages Router](https://nextjs.org/blog/next-15)
- [Configuração geral e Root Directory](https://vercel.com/docs/project-configuration/general-settings)
- [Node.js 24 em builds e funções](https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions)
