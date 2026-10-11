# Sistema de Menu para GitHub Pages com SQLite (sql.js)

Sistema simples de menu pesquisável para sites no GitHub Pages, usando banco SQLite carregado no navegador com **sql.js**.

Inclui uma área administrativa protegida por senha (client-side) para adicionar/remover páginas e baixar o banco atualizado.

## Arquivos

- `index.html` — Menu público com busca
- `admin.html` — Área administrativa
- `style.css` — Estilos
- `menu.db` — Banco de dados SQLite com as páginas

## Como usar no GitHub Pages

1. Coloque todos os arquivos na raiz do repositório (ou em uma pasta).
2. Ative o GitHub Pages no repositório (Settings → Pages).
3. Acesse o site. O menu carrega automaticamente o `menu.db`.

## Área Administrativa

- Acesse `admin.html`
- Senha padrão: **admin123**

### Como mudar a senha

1. Abra o console do navegador (F12) em qualquer página.
2. Cole e rode este código (substitua pela sua senha):

```js
await crypto.subtle.digest('SHA-256', new TextEncoder().encode('SUA_NOVA_SENHA'))
  .then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')))
```

3. Copie o hash que aparecer no console.
4. Abra o arquivo `admin.html` e substitua o valor de `SENHA_HASH` pelo novo hash.

### Como adicionar novas páginas

1. Entre na área admin.
2. Preencha o formulário e clique em "Adicionar".
3. Clique em **"Baixar menu.db atualizado"**.
4. Substitua o arquivo `menu.db` no seu repositório pelo arquivo baixado.
5. Faça commit + push.
6. O menu público será atualizado automaticamente.

## Aviso de Segurança

A proteção da área administrativa é **apenas no lado do cliente**. 

- Qualquer pessoa que olhar o código-fonte pode ver o hash e tentar descobrir a senha.
- Não use para proteger informações realmente sensíveis.
- Serve apenas como uma trava simples para evitar acesso casual.

## Personalização

- Edite o `style.css` para mudar cores e layout.
- Você pode adicionar mais campos na tabela se quiser (edite o SQL e os formulários).
- O banco já vem com algumas páginas de exemplo. Você pode apagá-las na área admin.

## Tecnologias

- HTML + CSS + JavaScript puro
- [sql.js](https://github.com/sql-js/sql.js) (SQLite no navegador via WebAssembly)
- GitHub Pages (hospedagem estática gratuita)
