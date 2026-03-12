# 📝 Handover: Estado do Projeto Almoxarifado

Este arquivo resume o progresso atual e os problemas pendentes para continuar o trabalho em outra máquina.

## 🎯 Status Atual do Ambiente
1.  **SSH**: Configurado e autenticado como `ivensaugusto` no GitHub.
2.  **Build**: `npm run build` está funcionando localmente (Health check OK).
3.  **CI/CD**: GitHub Actions configurado e disparado com sucesso (Run #8).

## 🚧 Problema Crítico: Deploy no Servidor
Apesar do GitHub Actions marcar o job como **Success**, o container `almoxarifado-app` **não aparece** no Portainer/Servidor Hetzner.

**Cenário Identificado:**
- O servidor (`49.13.156.225`) não respondeu ao `ping` (pode ser firewall).
- O script de deploy tenta rodar:
  ```bash
  docker run -d --name almoxarifado-app --network pwbot_net ...
  ```
- **Suspeita**: Se a rede `pwbot_net` não existir no Docker do servidor, o comando falha, mas a Action pode não ter interrompido o fluxo (precisa ver o log interno).

**Próximos Passos para Debug:**
1.  **Logs da Action**: Abrir a Run #8 no GitHub, expandir o passo "Deploy to Server" e ler a saída do comando `docker run`.
2.  **Rede**: Verificar no Portainer (aba Networks) se a rede se chama exatamente `pwbot_net`.
3.  **SSH Manual**: Tentar acessar o servidor via terminal (`ssh root@49.13.156.225`) e rodar `docker ps -a` para ver se o container foi criado e parou com erro (Exited).

## 💡 Contexto Recuperado (O que foi feito antes do crash)
- **Tabela de Pedidos**: A coluna "Disponibilidade" foi trocada por **"Cód. Produto"** (que mostra os 8 primeiros caracteres do UUID). O filtro de busca já reflete essa mudança.
- **Importação CSV**: O mapeamento está `DESCRIÇÃO DO ITEM` -> `nome` e `FORNECIMENTO` -> `unidade`.
- **Banco de Dados**: O RLS foi desabilitado via script `02_fix_rls_policies.sql` para permitir que o admin (que usa login estático no frontend) veja os pedidos.

---
*Este arquivo pode ser atualizado ou removido conforme os problemas forem resolvidos.*
