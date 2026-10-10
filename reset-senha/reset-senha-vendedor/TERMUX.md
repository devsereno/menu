# Enviar este zip pelo Termux → GitHub

No celular, com o zip baixado (Downloads):

```bash
pkg update -y
pkg install git unzip -y

cd ~/storage/downloads
# ou: cd /sdcard/Download

unzip reset-senha-vendedor.zip -d reset-senha-vendedor
cd reset-senha-vendedor

# Se o repo do Central ADM já existe:
cd ~/seu-repo
cp -r /sdcard/Download/reset-senha-vendedor ./reset-senha-vendedor

git add reset-senha-vendedor
git commit -m "feat: reset de senha do vendedor (admin + esqueci senha + troca obrigatória)"
git push
```

Se for um repo novo só deste pacote:

```bash
cd ~/storage/downloads/reset-senha-vendedor
git init
git add .
git commit -m "feat: reset de senha Fiscal Connect / Central ADM"
git branch -M main
git remote add origin git@github.com:SEU_USUARIO/reset-senha-vendedor.git
git push -u origin main
```
