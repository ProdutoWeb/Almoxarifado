# 📝 Handover de Estado: Setup do Ambiente e Pipeline (Almoxarifado)

> **Aviso para o Próximo Assistente**: Leia este arquivo para entender o contexto do que já foi configurado na máquina anterior e continuar exatamente de onde paramos.

## 🎯 Objetivo Inicial
Configurar o repositório Git local, autenticar o SSH com o GitHub e preparar o pipeline de CI/CD para o servidor na Hetzner (Portainer).

## ✅ O que já foi feito (Sincronizado via OneDrive)
1. **Dependências**: Executamos `npm install` e validamos que o `npm run build` funciona perfeitamente (gerando o `dist/`).
2. **Ignorando Lixo**: Atualizamos o `.gitignore` para ignorar `desktop.ini` do OneDrive.
3. **Git Local**: 
   - Inicializamos o repositório (`git init`).
   - Adicionamos o remote: `git remote add origin git@github.com:ProdutoWeb/Almoxarifado.git`.
4. **Pipeline (GitHub Actions para GHCR)**:
   - Identificamos (acessando a Hetzner via SSH) que o padrão do usuário no Portainer é rodar imagens via **GitHub Container Registry (ghcr.io)**.
   - Criamos o arquivo de pipeline em `.github/workflows/deploy.yml`. Ele constrói a imagem e dá push no GHCR a cada commit na `main`.
   - O projeto já possui o `Dockerfile`, `nginx.conf` e `docker-compose.yml` pré-configurados.

## 🚧 Bloqueios Atuais (Por que paramos?)
O fluxo parou pois **a chave SSH privada correspondente ao GitHub não estava nesta máquina**. A chave pública era `id_rsa_corp.pub` (uma chave ed25519), mas a privada (`id_ed25519_ufes`) não estava no `~/.ssh`.

## 🚀 Próximos Passos (Para a Nova Sessão)
Assim que você (usuário e assistente) abrirem este projeto no **novo PC**:

1. **Validar o SSH com o GitHub**:
   - Garanta que a chave SSH correta está configurada no novo PC.
   - Teste com: `ssh -T git@github.com`.

2. **Sincronizar e Enviar o Código**:
   - Se o SSH estiver OK, alinhe a branch local com a remota.
   - Adicione os arquivos gerados/modificados (`git add .`).
   - Faça o commit e o primeiro push para a `main`/`master` (`git push -u origin main`).

3. **Deploy no Portainer (Hetzner)**:
   - Ao fazer o push, o GitHub Actions (já configurado na pasta `.github`) vai rodar, fazer o build da imagem Docker e enviar para `ghcr.io/produtoweb/almoxarifado:latest`.
   - Acesse o Portainer na Hetzner (IP `49.13.156.225`), crie uma nova Stack copiando o conteúdo do `docker-compose.yml` que já temos aqui na raiz.

---
*Este arquivo pode ser deletado assim que o primeiro push for realizado com sucesso.*
