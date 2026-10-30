# Black ACLS 2026 · pacote de publicação

Páginas de captação da Black Friday do Prof. Marco Campos. Duas versões no mesmo site, para rodar teste A/B com o mesmo pixel e a mesma planilha.

| Rota | O que é | Atalho |
|---|---|---|
| `/` | **Página oficial.** Fundo preto, vermelho, formulário compacto | `/a` |
| `/obrigado` | Obrigado da página oficial | |
| `/v1/` | Versão alternativa, fundo branco, paleta azul e verde do perpétuo | `/b` |
| `/v1/obrigado` | Obrigado da versão alternativa | |
| `/grupo` | Redireciona direto para o grupo do WhatsApp | |

A versão vermelha ficou em `/v2` no primeiro deploy. Um redirecionamento 301 mantém qualquer link antigo funcionando.

Live de revelação: quinta, 12 de novembro de 2026, às 20h.

## Arquivos

```
index.html          página oficial, versão vermelha
obrigado.html       obrigado da página oficial
img/                capas dos 4 cursos, foto em aula, 7 depoimentos
v1/index.html       versão alternativa, branca
v1/obrigado.html    obrigado da versão alternativa
v1/img/             foto do Marco (recorte, turma, apontando)
netlify.toml        publish, cache e redirecionamentos
apps-script.gs      receptor da planilha de leads
```

## Antes de subir, três coisas faltam

1. **Aba na planilha de leads** com o nome exato `black_acls_2026`. Se a aba não existir com esse nome, o lead cai na primeira aba da planilha.
2. **URL da implantação do Apps Script**, para substituir `COLAR_URL_DA_IMPLANTACAO_DO_APPS_SCRIPT` em `index.html` e em `v1/index.html`.
3. **Repositório vazio** no GitHub do Raphael.

O link do grupo e o ID do pixel já estão nos arquivos.

## 1 · Planilha de leads

1. Abrir a planilha de leads do Marco e criar a aba `black_acls_2026`.
2. Extensões → Apps Script. Colar o conteúdo de `apps-script.gs`, salvar.
3. Implantar → Nova implantação → Tipo: app da Web.
   Executar como: **eu**. Quem pode acessar: **qualquer pessoa**.
4. Copiar a URL que termina em `/exec` e colar nas duas páginas, no campo `PLANILHA`.

Se mudar o script depois, use **Gerenciar implantações → Nova versão** na mesma implantação. Criar implantação nova troca a URL e quebra a captura.

A primeira linha da aba pode ficar vazia: o script cria o cabeçalho sozinho, com Data, Nome, Email, phone, as UTMs, url, src, fbclid e event_id. Se você preferir montar o cabeçalho à mão, pode reordenar as colunas à vontade, porque o script grava pelo nome da coluna.

## 2 · GitHub

Com o repositório vazio já criado, dentro desta pasta:

```bash
git init && git add . && git -c commit.gpgsign=false commit -m "Black ACLS 2026: paginas de captacao v1 e v2"
```

```bash
git branch -M main && git remote add origin git@github.com:raphaellateixeira/black-acls-2026.git && git push -u origin main
```

Troque o nome do repositório se você criar com outro.

## 3 · Netlify

1. Add new project → Import an existing project → GitHub → escolher o repositório.
   Se ele não aparecer na lista, abrir "Configure the Netlify app on GitHub" e liberar o acesso.
2. Build command: vazio. Publish directory: `.`. O `netlify.toml` já cuida do resto.
3. Deploy. Conferir o endereço provisório `<site>.netlify.app` e as duas versões.

## 4 · Subdomínio no Cloudflare

1. Netlify → Domain management → Add a domain → o subdomínio escolhido, por exemplo `black.descomplicaacls.com.br`.
2. Cloudflare, na zona do domínio → DNS → Add record:
   - Tipo **CNAME**
   - Nome: `black`
   - Destino: `<site>.netlify.app`
   - Proxy status: **DNS only**, nuvem cinza. Com a nuvem laranja o certificado da Netlify não sai.
3. Voltar na Netlify, marcar o subdomínio como **Primary domain** e esperar o HTTPS ficar verde. Costuma levar poucos minutos.

## 5 · Links para os anúncios

Use o mesmo padrão de UTM nas duas versões, mudando só o `utm_content`, para separar o desempenho:

```
https://black.descomplicaacls.com.br/?utm_source=meta&utm_medium=cpc&utm_campaign=black_acls_2026&utm_content=lpA
```

```
https://black.descomplicaacls.com.br/v1/?utm_source=meta&utm_medium=cpc&utm_campaign=black_acls_2026&utm_content=lpB
```

As UTMs ficam guardadas na sessão, seguem para a página de obrigado e são gravadas na planilha junto com o lead.

## 6 · Checagem depois de publicar

1. As duas páginas respondem e as imagens carregam.
2. No celular, o formulário inteiro aparece sem rolar. Medido em 390x664 e em 360x640 antes de entregar.
3. Pixel ativo: abrir o console e rodar `fbq.getState().pixels`. Deve aparecer o 537192752151289.
4. Marco ou alguém do time faz um cadastro de teste em cada versão e confere a linha na aba `black_acls_2026` e o evento Lead no Testar Eventos do Gerenciador.
5. Clicar no botão da página de obrigado e confirmar que entra no grupo.

## 7 · Pendências do projeto, fora do pacote

- **API de Conversões.** O `event_id` já vai do navegador para a planilha e para o evento Lead do pixel. Falta decidir por onde o servidor dispara: Stape, GTM server-side ou envio direto. O token da API nunca entra no código da página.
- **Preço da Black.** Decisão do cliente. Trava a página de vendas e o roteiro da revelação.
