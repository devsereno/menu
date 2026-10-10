cp $HOME/casameio/src/BrandIco.tsx "$BASE/src/"
cd "$BASE"
git add src/iconMap.ts src/BrandIco.tsx
git commit -m "fix: extrai icone via duckduckgo quando o site bloqueia"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-molde.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/screens/Casa.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/screens/Casa.tsx
git commit -m "feat: molde manter ou remover na casa"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-molde-valores.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/catalog.ts "$BASE/src/"
cp $HOME/casameio/src/screens/Casa.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/catalog.ts src/screens/Casa.tsx
git commit -m "feat: molde da casa com nomes e valores prontos"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-molde-troca.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/catalog.ts "$BASE/src/"
cp $HOME/casameio/src/store.tsx "$BASE/src/"
cp $HOME/casameio/src/screens/Casa.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Pessoal.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/catalog.ts src/store.tsx src/screens/Casa.tsx src/screens/Pessoal.tsx
git commit -m "feat: trocar molde inteiro da casa e do pessoal"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-exemplo-sync.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/store.tsx "$BASE/src/"
cp $HOME/casameio/src/sync.ts "$BASE/src/"
cp $HOME/casameio/src/screens/Casa.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Pessoal.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/store.tsx src/sync.ts src/screens/Casa.tsx src/screens/Pessoal.tsx
git commit -m "feat: exemplo inteiro sincroniza no supabase"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-exemplo-sync.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/store.tsx "$BASE/src/"
cp $HOME/casameio/src/sync.ts "$BASE/src/"
cp $HOME/casameio/src/screens/Casa.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Pessoal.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/store.tsx src/sync.ts src/screens/Casa.tsx src/screens/Pessoal.tsx
git commit -m "feat: exemplo inteiro sincroniza no supabase"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-pull-vazio.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/store.tsx "$BASE/src/"
cd "$BASE"
git add src/store.tsx
git commit -m "fix: nuvem vazia apaga lista local"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-exemplo-modal.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/catalog.ts "$BASE/src/"
cp $HOME/casameio/src/screens/ExemploModal.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Casa.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Pessoal.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/catalog.ts src/screens/ExemploModal.tsx src/screens/Casa.tsx src/screens/Pessoal.tsx
git commit -m "feat: modal de exemplos aluguel ou condominio"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-icone-fixo.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/icons.ts "$BASE/src/"
cp $HOME/casameio/src/BrandIco.tsx "$BASE/src/"
cp $HOME/casameio/src/screens/Pagar.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/icons.ts src/BrandIco.tsx src/screens/Pagar.tsx
git commit -m "fix: mesmo icone na baixa e casa no aluguel"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-auth-telas.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/App.tsx "$BASE/src/"
cp $HOME/casameio/src/sync.ts "$BASE/src/"
cp $HOME/casameio/src/index.css "$BASE/src/"
cp $HOME/casameio/src/screens/Login.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Registro.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/ConfirmarEmail.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/EntrarFamilia.tsx "$BASE/src/screens/"
cd "$BASE"
git add src
git commit -m "feat: login, registro e entrar na familia separados"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-sem-demo.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/screens/Login.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/screens/Login.tsx
git commit -m "fix: remove entrar so neste celular"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-nome-real.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/sync.ts "$BASE/src/"
cp $HOME/casameio/src/screens/Familia.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Home.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/sync.ts src/screens/Familia.tsx src/screens/Home.tsx
git commit -m "fix: nome de quem logou e membros reais"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-email-membros.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/sync.ts "$BASE/src/"
cp $HOME/casameio/src/screens/Familia.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Home.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/sync.ts src/screens/Familia.tsx src/screens/Home.tsx
git commit -m "fix: uma familia por login e email na conta"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-nome-login.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/sync.ts "$BASE/src/"
cp $HOME/casameio/src/screens/Login.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Home.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Registro.tsx "$BASE/src/screens/"
cd "$BASE"
git add src/sync.ts src/screens/Login.tsx src/screens/Home.tsx src/screens/Registro.tsx
git commit -m "fix: login cria familia e mostra nome"
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-confirmar-email.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/sync.ts "$BASE/src/"
cp $HOME/casameio/src/screens/Familia.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/EntrarFamilia.tsx "$BASE/src/screens/"
mkdir -p "$BASE/supabase"
cp $HOME/casameio/supabase/join-requests.sql "$BASE/supabase/"
cd "$BASE"
git add src/sync.ts src/screens/Familia.tsx src/screens/EntrarFamilia.tsx supabase/join-requests.sql
git commit -m "feat: responsavel confirma email de quem pediu pra entrar"
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p public src
BASE=/storage/emulated/0/Documents/PWA_Fiscal_Pastas
cp "$BASE/index.html" index.html
cp -r "$BASE/public/." public/
cp "$BASE/src/pwa.ts" src/pwa.ts
cp "$BASE/src/main.tsx" src/main.tsx
git add index.html public src/pwa.ts src/main.tsx
git commit -m "feat: pwa com icone e tela cheia"
git push origin main
cd $HOME
ls storage/downloads | grep -i PWA
ls /storage/emulated/0/Download | grep -i PWA
ls /storage/emulated/0/Documents | grep -i PWA
ls /storage/emulated/0/Documents/PWA_Fiscal_Pastas
ls /storage/emulated/0/Documents/PWA_Fiscal_Pastas/PWA_Fiscal_Pastas
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p public src
BASE=/storage/emulated/0/Documents/PWA_Fiscal_Pastas/PWA_Fiscal_Pastas
cp "$BASE/index.html" index.html
cp -r "$BASE/public/." public/
cp "$BASE/src/pwa.ts" src/pwa.ts
cp "$BASE/src/main.tsx" src/main.tsx
git add index.html public src/pwa.ts src/main.tsx
git status
git commit -m "feat: pwa com icone e tela cheia"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
BASE=/storage/emulated/0/Documents/Ux_Caixa_Cupom
cp "$BASE/whatsapp.ts" src/lib/whatsapp.ts
cp "$BASE/CaixaPage.tsx" src/pages/CaixaPage.tsx
cp "$BASE/CompraPage.tsx" src/pages/CompraPage.tsx
cp "$BASE/moneyInput.ts" src/lib/moneyInput.ts
cp "$BASE/MoneyInput.tsx" src/components/MoneyInput.tsx
cp "$BASE/HomePage.tsx" src/pages/HomePage.tsx
git add src/lib/whatsapp.ts src/lib/moneyInput.ts src/pages/CaixaPage.tsx src/pages/CompraPage.tsx src/pages/HomePage.tsx src/components/MoneyInput.tsx
git commit -m "ux: loja no cupom, fiado padrao, mascara e spinner"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
BASE=/storage/emulated/0/Documents/Ux_Caixa_Cupom
cp "$BASE/whatsapp.ts" src/lib/whatsapp.ts
cp "$BASE/CaixaPage.tsx" src/pages/CaixaPage.tsx
cp "$BASE/CompraPage.tsx" src/pages/CompraPage.tsx
cp "$BASE/moneyInput.ts" src/lib/moneyInput.ts
cp "$BASE/MoneyInput.tsx" src/components/MoneyInput.tsx
cp "$BASE/HomePage.tsx" src/pages/HomePage.tsx
git add src/lib/whatsapp.ts src/lib/moneyInput.ts src/pages/CaixaPage.tsx src/pages/CompraPage.tsx src/pages/HomePage.tsx src/components/MoneyInput.tsx
git commit -m "ux: loja no cupom, fiado padrao, mascara e spinner"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
BASE=/storage/emulated/0/Documents/Estoque_Mascara
cp "$BASE/EstoquePage.tsx" src/pages/EstoquePage.tsx
cp "$BASE/moneyInput.ts" src/lib/moneyInput.ts
cp "$BASE/MoneyInput.tsx" src/components/MoneyInput.tsx
git add src/pages/EstoquePage.tsx src/lib/moneyInput.ts src/components/MoneyInput.tsx
git commit -m "ux: mascara de preco no estoque"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
ls /storage/emulated/0/Documents/Caixa_Icones
ls /storage/emulated/0/Documents/Caixa_Icones/Caixa_Icones
cd $HOME/fiscal-connect/fiscal-connect
ls /storage/emulated/0/Documents/Caixa_Icones
ls /storage/emulated/0/Documents/Caixa_Icones/Caixa_Icones
cd $HOME/fiscal-connect/fiscal-connect
ls /storage/emulated/0/Documents/Caixa_Icones
ls /storage/emulated/0/Documents/Caixa_Icones/Caixa_Icones
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o $HOME/storage/downloads/Caixa_Icones.zip -d $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Caixa_Icones.zip -d $HOME/tmp-zip
unzip -o /storage/emulated/0/Documents/Caixa_Icones.zip -d $HOME/tmp-zip
ARQ=$(find $HOME/tmp-zip /storage/emulated/0/Documents/Caixa_Icones -name CaixaPage.tsx 2>/dev/null | head -n 1)
echo "ARQUIVO=$ARQ"
cp "$ARQ" src/pages/CaixaPage.tsx
git add src/pages/CaixaPage.tsx
git status
git commit -m "ux: legenda produto e icones avista fiado"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o $HOME/storage/downloads/Caixa_Nota.zip -d $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Caixa_Nota.zip -d $HOME/tmp-zip
unzip -o /storage/emulated/0/Documents/Caixa_Nota.zip -d $HOME/tmp-zip
ARQ=$(find $HOME/tmp-zip /storage/emulated/0/Documents/Caixa_Nota -name CaixaPage.tsx 2>/dev/null | head -n 1)
echo "ARQUIVO=$ARQ"
cp "$ARQ" src/pages/CaixaPage.tsx
git add src/pages/CaixaPage.tsx
git commit -m "ux: fundo da nota no caixa"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip src/lib src/components
unzip -o $HOME/storage/downloads/Tema_Claro_Escuro.zip -d $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Tema_Claro_Escuro.zip -d $HOME/tmp-zip
unzip -o /storage/emulated/0/Documents/Tema_Claro_Escuro.zip -d $HOME/tmp-zip
BASE=$(find $HOME/tmp-zip -name theme.ts | head -n 1 | xargs dirname)
echo "BASE=$BASE"
cp "$BASE/theme.ts" src/lib/theme.ts
cp "$BASE/ThemeToggle.tsx" src/components/ThemeToggle.tsx
cp "$BASE/AppShell.tsx" src/components/AppShell.tsx
cp "$BASE/index.css" src/index.css
cp "$BASE/index.html" index.html
git add src/lib/theme.ts src/components/ThemeToggle.tsx src/components/AppShell.tsx src/index.css index.html
git commit -m "feat: tema claro e escuro"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o $HOME/storage/downloads/Tema_Letras.zip -d $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Tema_Letras.zip -d $HOME/tmp-zip
unzip -o /storage/emulated/0/Documents/Tema_Letras.zip -d $HOME/tmp-zip
ARQ=$(find $HOME/tmp-zip -name index.css | head -n 1)
echo "ARQUIVO=$ARQ"
cp "$ARQ" src/index.css
git add src/index.css
git commit -m "fix: contraste do texto no tema claro"
git pull --rebase origin main
git push origin main
cd $HOME/central-adm
mkdir -p $HOME/tmp-zip src/lib src/pages
BASE=$(find $HOME/tmp-zip -name adm-TutorialPage.tsx | head -n 1 | xargs dirname)
cp "$BASE/youtube.ts" src/lib/youtube.ts
cp "$BASE/adm-TutorialPage.tsx" src/pages/TutorialPage.tsx
cp "$BASE/adm-App.tsx" src/App.tsx
cp "$BASE/adm-Shell.tsx" src/pages/Shell.tsx
git add src/lib/youtube.ts src/pages/TutorialPage.tsx src/App.tsx src/pages/Shell.tsx
git commit -m "feat: cadastro de tutoriais no adm"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip src/lib src/pages src/components
unzip -o $HOME/storage/downloads/Tutorial_ADM_Fiscal.zip -d $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Tutorial_ADM_Fiscal.zip -d $HOME/tmp-zip
unzip -o /storage/emulated/0/Documents/Tutorial_ADM_Fiscal.zip -d $HOME/tmp-zip
BASE=$(find $HOME/tmp-zip -name youtube.ts | head -n 1 | xargs dirname)
echo "BASE=$BASE"
cp "$BASE/youtube.ts" src/lib/youtube.ts
cp "$BASE/TutorialListaPage.tsx" src/pages/TutorialListaPage.tsx
cp "$BASE/TutorialPlayerPage.tsx" src/pages/TutorialPlayerPage.tsx
cp "$BASE/ContaPage.tsx" src/pages/ContaPage.tsx
cp "$BASE/fiscal-App.tsx" src/App.tsx
cp "$BASE/AppShell.tsx" src/components/AppShell.tsx
git add src/lib/youtube.ts src/pages/TutorialListaPage.tsx src/pages/TutorialPlayerPage.tsx src/pages/ContaPage.tsx src/App.tsx src/components/AppShell.tsx
git status
git commit -m "feat: pagina tutorial no fiscal"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip src/components
unzip -o /storage/emulated/0/Download/Tutorial_Cliente_Bloco.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/TutorialClienteBloco.tsx src/components/
python3 $HOME/tmp-zip/aplicar_bloco.py
git add src/components/TutorialClienteBloco.tsx src/pages/PublicoClientePage.tsx
git commit -m "feat: video tutorial na conta do cliente"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Publico_Guia_Historico.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/PublicoClientePage.tsx src/pages/PublicoClientePage.tsx
git add src/pages/PublicoClientePage.tsx
git commit -m "ux: guia no youtube e historico com veja mais"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip src/pages src/components
unzip -o /storage/emulated/0/Download/Fila_Comprovantes.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/ComprovantesFilaPage.tsx src/pages/
cp $HOME/tmp-zip/AppShell.tsx src/components/
cp $HOME/tmp-zip/App.tsx src/
git add src/pages/ComprovantesFilaPage.tsx src/components/AppShell.tsx src/App.tsx
git commit -m "feat: aviso pix no topo e fila de comprovantes"
git pull --rebase origin main
git push origin main
cd $HOME
unzip -o $HOME/storage/downloads/casameio-melhorias.zip -d $HOME
BASE=/storage/emulated/0/Documents/casameio
cp $HOME/casameio/src/sync.ts "$BASE/src/"
cp $HOME/casameio/src/screens/Casa.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Pessoal.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Home.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Pagar.tsx "$BASE/src/screens/"
cp $HOME/casameio/src/screens/Familia.tsx "$BASE/src/screens/"
cd "$BASE"
git add src
git commit -m "ux: casa vazia, sem pagar zero, inicio curto, familia limpa"
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip src/pages src/components
unzip -o /storage/emulated/0/Download/Preview_Cliente.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/PublicoClientePage.tsx src/pages/
cp $HOME/tmp-zip/ModalComprovante.tsx src/components/
git add src/pages/PublicoClientePage.tsx src/components/ModalComprovante.tsx
git commit -m "ux: previa de foto e PDF na conta do cliente"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip src/pages src/components
unzip -o /storage/emulated/0/Download/Preview_Cliente.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/PublicoClientePage.tsx src/pages/
cp $HOME/tmp-zip/ModalComprovante.tsx src/components/
git add src/pages/PublicoClientePage.tsx src/components/ModalComprovante.tsx
git commit -m "ux: confirmar comprovante na previa do cliente"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Auto_Caixa_Modal.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/AutoCaixaPage.tsx src/pages/AutoCaixaPage.tsx
cp $HOME/tmp-zip/AutoFilaPage.tsx src/pages/AutoFilaPage.tsx
git add src/pages/AutoCaixaPage.tsx src/pages/AutoFilaPage.tsx
git commit -m "ux: modal de encerrar e excluir solicitacao"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Auto_Caixa_Banca.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/AutoCaixaPage.tsx src/pages/AutoCaixaPage.tsx
git add src/pages/AutoCaixaPage.tsx
git commit -m "fix: banca preta no auto caixa"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Auto_Caixa_Pausa.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/AutoCaixaPage.tsx src/pages/AutoCaixaPage.tsx
git add src/pages/AutoCaixaPage.tsx
git commit -m "ux: compras em pausa na banca"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Auto_Caixa_Volta.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/AutoCaixaPage.tsx src/pages/AutoCaixaPage.tsx
git add src/pages/AutoCaixaPage.tsx
git commit -m "ux: banca nao sai no voltar e nota some em 5s"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Auto_Caixa_Volta.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/AutoCaixaPage.tsx src/pages/AutoCaixaPage.tsx
git add src/pages/AutoCaixaPage.tsx
git commit -m "ux: banca nao sai no voltar e nota some em 5s"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Auto_Menu_Lista.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/AppShell.tsx src/components/AppShell.tsx
cp $HOME/tmp-zip/AutoCaixaPage.tsx src/pages/AutoCaixaPage.tsx
git add src/components/AppShell.tsx src/pages/AutoCaixaPage.tsx
git commit -m "ux: menu auto, lista da banca e senha errada"
git pull --rebase origin main
git push origin main
cd $HOME/fiscal-connect/fiscal-connect
mkdir -p $HOME/tmp-zip
unzip -o /storage/emulated/0/Download/Auto_Menu_Lista_Fix.zip -d $HOME/tmp-zip
cp $HOME/tmp-zip/AppShell.tsx src/components/AppShell.tsx
cp $HOME/tmp-zip/AutoCaixaPage.tsx src/pages/AutoCaixaPage.tsx
git add src/components/AppShell.tsx src/pages/AutoCaixaPage.tsx
git commit -m "fix: build da banca"
git pull --rebase origin main
git push origin main
pkg install -y git
termux-setup-storage
cd \~/storage/downloads || cd /storage/emulated/0/Download
ls index.html apuracao-colinha.html
git config --global user.name "devsereno"
git config --global user.email "devsereno@users.noreply.github.com"
git init -b main
git add index.html apuracao-colinha.html
git commit -m "Painel de apuração ES 2026"
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/devsereno/Apura.git
git push -u origin main
git init -b main
git add index.html apuracao-colinha.html
git commit -m "Painel de apuração ES 2026"
git remote add origin https://github.com/devsereno/Apura.git
git push -u origin main
cd \~/storage/downloads || cd /storage/emulated/0/Download
cp -f index-1.html index.html
git init -b main
git add index.html apuracao-colinha.html
git commit -m "Painel de apuração ES 2026"
git remote add origin https://github.com/devsereno/Apura.git
git push -u origin main
cd \~/storage/downloads || cd /storage/emulated/0/Download
cp -f index-1.html index.html
git init -b main
git add index.html apuracao-colinha.html
git commit -m "Painel de apuração ES 2026"
git remote add origin https://github.com/devsereno/Apura.git
git push -u origin main
git config --global --add safe.directory /storage/emulated/0/Download
cp -f index-1.html index.html
git add index.html apuracao-colinha.html
git commit -m "Painel de apuração ES 2026"
git remote add origin https://github.com/devsereno/Apura.git
git push -u origin main
cp -f index-1.html index.html
git add index.html apuracao-colinha.html
git commit -m "Fotos e cards em duas colunas"
git push
cd /storage/emulated/0/Download
cp -f index-1.html index.html
git add index.html apuracao-colinha.html
git commit -m "Mais votados e eleitos"
git push
cd /storage/emulated/0/Download
cp -f index-1.html index.html
git add index.html apuracao-colinha.html
git commit -m "Corrige vazamento dos cards"
git push
cd /storage/emulated/0/Download
cp -f index-1.html index.html
git add index.html apuracao-colinha.html
git commit -m "Seta desce a página e para no fim"
git push
cd /storage/emulated/0/Download
cp -f index-1.html index.html
git add index.html apuracao-colinha.html
git commit -m "Vagas de deputado e eleitos"
git push
cd /storage/emulated/0/Download
cp -f index-1.html index.html
git add index.html apuracao-colinha.html
git commit -m "Vagas de deputado e eleitos"
git push
cd /storage/emulated/0/Download
cp -f index-1.html index.html
git add index.html apuracao-colinha.html
git commit -m "Lista de eleitos igual ao card de escolha"
git push
cd /storage/emulated/0/Download
cp -f index-1.html index.html
git add index.html apuracao-colinha.html
git commit -m "Não derruba o placar se um arquivo falhar"
git push
cd /storage/emulated/0/Download
cp -f index-1.html index.html
git add index.html apuracao-colinha.html
git commit -m "Não derruba o placar se um arquivo falhar"
git push
