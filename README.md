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

## Captura dos leads

As duas páginas mandam o lead para o webhook do n8n da Última:

```
https://n8n.agenciaultima.com.br/webhook/a1817a13-d8d1-459e-aafd-c97f38145184
```

O envio é um POST em `application/x-www-form-urlencoded`, modo `no-cors`, então o n8n recebe o corpo já separado em campos, sem precisar de parse. Os campos são estes:

| Campo | O que traz |
|---|---|
| `first_name` | o nome digitado |
| `email` | o e-mail digitado |
| `phone` | só os dígitos, com o + na frente quando for número de fora do Brasil |
| `utm_source`, `utm_medium`, `utm_content`, `utm_term`, `utm_campaign`, `utm_campaign_id` | as UTMs do anúncio |
| `src` | o parâmetro completo de origem |
| `full_url` | a URL inteira, com a query |
| `query_string` | só a query, começando com ? |
| `submitted_at` | data e hora do envio, em ISO |
| `event_id` | o mesmo id enviado no evento Lead do pixel, para deduplicar na API de Conversões |
| `evento` | `BlackACLS` |
| `fbclid`, `fbp`, `fbc`, `user_agent` | o que a API de Conversões precisa para casar o evento |

Todos os campos vão sempre, em branco quando não existirem, para a posição das colunas nunca mudar.

O `full_url` é o que separa a página oficial da versão `/v1`, porque as duas mandam o mesmo `evento`.

Como o envio é `no-cors`, a página não lê a resposta do webhook: ela segue para a página de obrigado assim que a requisição parte, ou depois de 2,5 segundos, o que vier primeiro. Ou seja, o lead nunca fica preso esperando o n8n.

O `apps-script.gs` continua no repositório como caminho alternativo, caso um dia a gravação volte a ser direta na planilha. Com o n8n no ar ele não é usado.

O link do grupo e o ID do pixel já estão nos arquivos.

## 1 · GitHub

Com o repositório vazio já criado, dentro desta pasta:

```bash
git init && git add . && git -c commit.gpgsign=false commit -m "Black ACLS 2026: paginas de captacao v1 e v2"
```

```bash
git branch -M main && git remote add origin git@github.com:raphaellateixeira/black-acls-2026.git && git push -u origin main
```

Troque o nome do repositório se você criar com outro.

## 2 · Netlify

1. Add new project → Import an existing project → GitHub → escolher o repositório.
   Se ele não aparecer na lista, abrir "Configure the Netlify app on GitHub" e liberar o acesso.
2. Build command: vazio. Publish directory: `.`. O `netlify.toml` já cuida do resto.
3. Deploy. Conferir o endereço provisório `<site>.netlify.app` e as duas versões.

## 3 · Subdomínio no Cloudflare

1. Netlify → Domain management → Add a domain → o subdomínio escolhido, por exemplo `black.descomplicaacls.com.br`.
2. Cloudflare, na zona do domínio → DNS → Add record:
   - Tipo **CNAME**
   - Nome: `black`
   - Destino: `<site>.netlify.app`
   - Proxy status: **DNS only**, nuvem cinza. Com a nuvem laranja o certificado da Netlify não sai.
3. Voltar na Netlify, marcar o subdomínio como **Primary domain** e esperar o HTTPS ficar verde. Costuma levar poucos minutos.

## 4 · Links para os anúncios

Use o mesmo padrão de UTM nas duas versões, mudando só o `utm_content`, para separar o desempenho:

```
https://black.descomplicaacls.com.br/?utm_source=meta&utm_medium=cpc&utm_campaign=black_acls_2026&utm_content=lpA
```

```
https://black.descomplicaacls.com.br/v1/?utm_source=meta&utm_medium=cpc&utm_campaign=black_acls_2026&utm_content=lpB
```

As UTMs ficam guardadas na sessão, seguem para a página de obrigado e são gravadas na planilha junto com o lead.

## 5 · Checagem depois de publicar

1. As duas páginas respondem e as imagens carregam.
2. No celular, o formulário inteiro aparece sem rolar. Medido em 390x664 e em 360x640 antes de entregar.
3. Pixel ativo: abrir o console e rodar `fbq.getState().pixels`. Deve aparecer o 537192752151289.
4. Marco ou alguém do time faz um cadastro de teste em cada versão e confere: a execução no n8n, a linha na planilha e o evento Lead no Testar Eventos do Gerenciador.
5. Clicar no botão da página de obrigado e confirmar que entra no grupo.

## 6 · Pendências do projeto, fora do pacote

- **API de Conversões.** O `event_id` já vai do navegador para a planilha e para o evento Lead do pixel. Falta decidir por onde o servidor dispara: Stape, GTM server-side ou envio direto. O token da API nunca entra no código da página.
- **Preço da Black.** Decisão do cliente. Trava a página de vendas e o roteiro da revelação.
